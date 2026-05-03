import { Injectable, inject, signal, computed } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UnreadCount {
  clientId: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class UnreadMessagesService {
  private sb = supabase;

  // Map de clientId → nº mensajes no leídos
  private _unread = signal<Record<string, number>>({});
  unread = this._unread.asReadonly();

  // Total global para el icono del chat en la navbar
  totalUnread = computed(() =>
    Object.values(this._unread()).reduce((sum, n) => sum + n, 0)
  );

  private channel: RealtimeChannel | null = null;

  async loadUnread(userId: string) {
    const { data } = await this.sb
      .from('messages')
      .select('sender_id, read_at')
      .eq('receiver_id', userId)
      .is('read_at', null);

    if (!data) return;

    const counts: Record<string, number> = {};
    for (const msg of data) {
      counts[msg.sender_id] = (counts[msg.sender_id] ?? 0) + 1;
    }
    this._unread.set(counts);
  }

  subscribeRealtime(userId: string) {
    if (this.channel) return;

    this.channel = this.sb
      .channel('unread-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const senderId = payload.new['sender_id'];
          this._unread.update(prev => ({
            ...prev,
            [senderId]: (prev[senderId] ?? 0) + 1,
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new['read_at']) {
            this.loadUnread(userId);
          }
        }
      )
      .subscribe();
  }

  async markAsRead(receiverId: string, senderId: string) {
    await this.sb
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', receiverId)
      .eq('sender_id', senderId)
      .is('read_at', null);

    this._unread.update(prev => {
      const next = { ...prev };
      delete next[senderId];
      return next;
    });
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
