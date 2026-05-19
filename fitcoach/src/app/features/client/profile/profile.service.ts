import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RealtimeChannel } from '@supabase/supabase-js';

export type Goal  = 'fat_loss' | 'muscle_gain' | 'strength' | 'health';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface ClientProfile {
  id:                 string;
  full_name:          string;
  height_cm:          number | null;
  birth_date:         string | null;
  goal:               Goal | null;
  level:              Level | null;
  profile_completed:  boolean;
  equipped_frame:     string | null;
  unlocked_frames:    string[];
  banner_color:       string | null;
  banner_pattern:     string | null;
  unlocked_banners:   string[];
  xp?:                number;
  rank?:              string;
  bio?:               string | null;
  avatar_url?:        string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private sb   = inject(SupabaseService).client;
  private auth = inject(AuthService);

  // Signal global — lo leen navbar, dashboard, coach y selectores
  profile = signal<ClientProfile | null>(null);

  // Computed helpers para simplificar el uso en componentes nuevos
  readonly equippedFrame = computed(() => this.profile()?.equipped_frame ?? 'none');
  readonly displayName = computed(() => this.profile()?.full_name ?? 'Atleta');

  private activeSubscription = false;
  private profileChannel: RealtimeChannel | null = null;

  async load(): Promise<ClientProfile | null> {
    const userId = this.auth.user()?.id;
    if (!userId) return null;

    if (!this.activeSubscription) {
      this.subscribeToProfileChanges(userId);
      this.activeSubscription = true;
    }

    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[ProfileService] Error cargando perfil:', error.message);
      return null;
    }
    this.profile.set(data);
    return data;
  }

  async save(updates: Partial<Omit<ClientProfile, 'id'>>): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { error } = await this.sb
      .from('profiles')
      .update({ ...updates, profile_completed: true })
      .eq('id', userId);

    if (error) throw new Error(error.message);

    // Actualizar signal local sin refetch
    this.profile.update(p => p ? { ...p, ...updates, profile_completed: true } : p);
  }

  // Cargar perfil por ID (para ver a otros usuarios, como el coach viendo atletas)
  async getProfile(userId: string): Promise<ClientProfile | null> {
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[ProfileService] Error obteniendo perfil:', error.message);
      return null;
    }

    return data;
  }

  // Actualizar el marco equipado (con rollback optimista)
  async updateEquippedFrame(frameId: string) {
    const p = this.profile();
    if (!p) return;

    // Guardar estado anterior por si hay error
    const previousFrame = p.equipped_frame;

    // Actualización optimista del signal
    this.profile.set({
      ...p,
      equipped_frame: frameId
    });

    const { error } = await this.sb
      .from('profiles')
      .update({ equipped_frame: frameId })
      .eq('id', p.id);

    if (error) {
      console.error('[ProfileService] Error actualizando marco. Revirtiendo...', error.message);
      // Rollback
      this.profile.set({
        ...p,
        equipped_frame: previousFrame
      });
      throw error;
    }
  }

  // Actualizar configuración del banner
  async updateBanner(updates: { banner_color: string | null; banner_pattern: string | null }) {
    const p = this.profile();
    if (!p) return;

    const previous = {
      color: p.banner_color,
      pattern: p.banner_pattern
    };

    // Actualización optimista
    this.profile.set({
      ...p,
      banner_color: updates.banner_color,
      banner_pattern: updates.banner_pattern
    });

    const { error } = await this.sb
      .from('profiles')
      .update({
        banner_color: updates.banner_color,
        banner_pattern: updates.banner_pattern
      })
      .eq('id', p.id);

    if (error) {
      console.error('[ProfileService] Error actualizando banner:', error.message);
      // Rollback
      this.profile.set({
        ...p,
        banner_color: previous.color,
        banner_pattern: previous.pattern
      });
      throw error;
    }
  }

  // Calcula edad a partir de birth_date
  age(profile: ClientProfile | null): number | null {
    if (!profile?.birth_date) return null;
    const diff = Date.now() - new Date(profile.birth_date).getTime();
    return Math.floor(diff / (365.25 * 86_400_000));
  }

  goalLabel(goal: Goal | null): string {
    const map: Record<Goal, string> = {
      fat_loss:     'Perder grasa',
      muscle_gain:  'Ganar músculo',
      strength:     'Fuerza máxima',
      health:       'Salud general',
    };
    return goal ? map[goal] : '—';
  }

  goalEmoji(goal: Goal | null): string {
    const map: Record<Goal, string> = {
      fat_loss:    '🔥',
      muscle_gain: '💪',
      strength:    '🏋️',
      health:      '🌱',
    };
    return goal ? map[goal] : '—';
  }

  levelLabel(level: Level | null): string {
    const map: Record<Level, string> = {
      beginner:     'Principiante',
      intermediate: 'Intermedio',
      advanced:     'Avanzado',
    };
    return level ? map[level] : '—';
  }

  // Suscripción Realtime a los cambios del perfil en Supabase
  private subscribeToProfileChanges(userId: string) {
    if (this.profileChannel) {
      try {
        this.sb.removeChannel(this.profileChannel);
      } catch (e) {
        console.warn('[ProfileService] Error removiendo canal existente:', e);
      }
      this.profileChannel = null;
    }

    this.profileChannel = this.sb
      .channel(`profile-${userId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('[ProfileService] Cambio en tiempo real recibido:', payload.new);
          this.profile.update(p => p ? { ...p, ...payload.new } : (payload.new as ClientProfile));
        }
      );
    this.profileChannel.subscribe();
  }
}
