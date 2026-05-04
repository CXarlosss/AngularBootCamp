import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { signal } from '@angular/core';

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
  unlocked_banners:    string[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private sb   = inject(SupabaseService).client;
  private auth = inject(AuthService);

  // Signal global — lo leen navbar, dashboard, coach
  profile = signal<ClientProfile | null>(null);

  async load(): Promise<ClientProfile | null> {
    const userId = this.auth.user()?.id; // Usando .user() que es la señal en AuthService
    if (!userId) return null;

    const { data, error } = await this.sb
      .from('profiles')
      .select('id, full_name, height_cm, birth_date, goal, level, profile_completed, equipped_frame, unlocked_frames, banner_color, banner_pattern, unlocked_banners')
      .eq('id', userId)
      .single();

    if (error) { console.error('[ProfileService]', error.message); return null; }
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
}
