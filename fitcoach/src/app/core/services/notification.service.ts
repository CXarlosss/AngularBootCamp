import {
  Injectable, inject, signal, computed
} from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AppNotification {
  id:         string;
  type:       'workout_completed' | 'routine_assigned' | 'new_message' | 'coach_feedback';
  title:      string;
  body:       string;
  data:       Record<string, any>;
  read_at:    string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sb   = inject(SupabaseService).client;
  private auth = inject(AuthService);

  private _notifications = signal<AppNotification[]>([]);
  notifications = this._notifications.asReadonly();

  unreadCount = computed(() =>
    this._notifications().filter(n => !n.read_at).length
  );

  private channel: RealtimeChannel | null = null;
  private toastTimeout: any = null;

  // Toast temporal para in-app
  activeToast = signal<AppNotification | null>(null);

  // ─── Carga inicial ──────────────────────────────────────────────────────────

  async load(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { data } = await this.sb
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    this._notifications.set(data ?? []);
  }

  // ─── Realtime ───────────────────────────────────────────────────────────────

  subscribe(): void {
    const userId = this.auth.user()?.id;
    if (!userId || this.channel) return;

    this.channel = this.sb
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notif = payload.new as AppNotification;
          // Añadir al principio de la lista
          this._notifications.update(prev => [notif, ...prev]);
          // Mostrar toast in-app
          this.showToast(notif);
        }
      )
      .subscribe();
  }

  unsubscribe(): void {
    this.channel?.unsubscribe();
    this.channel = null;
  }

  // ─── Toast in-app ───────────────────────────────────────────────────────────

  private showToast(notif: AppNotification): void {
    clearTimeout(this.toastTimeout);
    this.activeToast.set(notif);
    this.toastTimeout = setTimeout(() => {
      this.activeToast.set(null);
    }, 4000);
  }

  dismissToast(): void {
    clearTimeout(this.toastTimeout);
    this.activeToast.set(null);
  }

  // ─── Marcar leído ───────────────────────────────────────────────────────────

  async markRead(id: string): Promise<void> {
    await this.sb
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    this._notifications.update(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  }

  async markAllRead(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    await this.sb
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    this._notifications.update(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
  }

  // ─── Crear notificación (llamado desde otros servicios) ─────────────────────

  async create(
    targetUserId: string,
    type: AppNotification['type'],
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    const { error } = await this.sb
      .from('notifications')
      .insert({ user_id: targetUserId, type, title, body, data });

    if (error) console.error('[NotificationService] create:', error.message);
  }

  // ─── FCM — placeholder para después ─────────────────────────────────────────
  async registerFCMToken(token: string): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    await this.sb
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', userId);
  }
}
