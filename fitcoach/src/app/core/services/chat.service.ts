import { Injectable, inject, OnDestroy } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';
import { ChatMessage, Conversation, MessageType } from '../../state/chat.store';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { RealtimeResilienceService, ChannelHandle } from './realtime-resilience.service';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private sb      = supabase;
  private notifSvc = inject(NotificationService);
  private resilience = inject(RealtimeResilienceService);
  private channelHandle: ChannelHandle | null = null;

  // ── Realtime ──────────────────────────────────────────────────────

  subscribeToConversation(
    myId:      string,
    partnerId: string,
    onMessage: (msg: ChatMessage) => void,
    onStatus?: (status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED') => void
  ): void {
    this.unsubscribe();

    const channelName = `conv:${[myId, partnerId].sort().join('_')}`;

    this.channelHandle = this.resilience.subscribe({
      channelName,
      filters: [
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `receiver_id=eq.${myId}`,
        },
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'messages',
          filter: `sender_id=eq.${myId}`,
        },
      ],
      onMessage: (payload) => {
        console.log('[ChatService] Realtime payload:', payload);
        if (payload.eventType === 'INSERT') {
          onMessage(this.mapRow(payload.new));
        }
      },
      onStatusChange: onStatus,
    });
  }

  unsubscribe(): void {
    this.channelHandle?.destroy();
    this.channelHandle = null;
  }

  // ── CRUD ──────────────────────────────────────────────────────────

  async sendMessage(
    senderId:   string,
    receiverId: string,
    content:    string,
    type:       MessageType = 'text',
    metadata?:  Record<string, any>
  ): Promise<void> {
    const { error } = await this.sb.from('messages').insert({
      sender_id:   senderId,
      receiver_id: receiverId,
      content,
      type,
      metadata:    metadata ?? null,
      status:      'sent',
    });
    if (error) throw error;

    // Notificar al receptor
    try {
      const { data: sender } = await this.sb
        .from('profiles')
        .select('full_name, role')
        .eq('id', senderId)
        .single();
      
      const senderName = sender?.full_name ?? 'Alguien';

      await this.notifSvc.create(
        receiverId,
        'new_message',
        sender?.role === 'coach' ? '💬 Mensaje de tu entrenador' : `💬 ${senderName}`,
        content.length > 60 ? content.substring(0, 60) + '…' : content,
        { sender_id: senderId }
      );
    } catch (e) {
      console.error('[ChatService] Error al notificar mensaje:', e);
    }
  }

  async getHistory(myId: string, partnerId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.sb
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),` +
        `and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true })
      .limit(100);   // últimos 100 mensajes, suficiente para MVP

    if (error) throw error;
    return (data ?? []).map(this.mapRow);
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    await this.sb
      .from('messages')
      .update({ status: 'read' })
      .in('id', messageIds);
  }

  // Lista de clientes con su último mensaje y unread count (para el coach)
  async getCoachConversations(coachId: string): Promise<Conversation[]> {
    // Traemos los clientes del coach con su último mensaje
    const { data: clients } = await this.sb
      .from('profiles')
      .select('id, full_name')
      .eq('coach_id', coachId);

    if (!clients?.length) return [];

    const conversations = await Promise.all(
      clients.map(async (client): Promise<Conversation> => {
        // Último mensaje de la conversación
        const { data: last } = await this.sb
          .from('messages')
          .select('content, created_at, status, receiver_id')
          .or(
            `and(sender_id.eq.${coachId},receiver_id.eq.${client.id}),` +
            `and(sender_id.eq.${client.id},receiver_id.eq.${coachId})`
          )
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Contador de no leídos
        const { count } = await this.sb
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id',   client.id)
          .eq('receiver_id', coachId)
          .neq('status', 'read');

        return {
          partnerId:   client.id,
          partnerName: client.full_name,
          lastMessage: last?.content ?? 'Sin mensajes aún',
          lastTime:    last ? new Date(last.created_at) : new Date(0),
          unread:      count ?? 0,
        };
      })
    );

    return conversations.sort(
      (a, b) => b.lastTime.getTime() - a.lastTime.getTime()
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private mapRow = (row: any): ChatMessage => {
    return {
      id:         row.id,
      senderId:   row.sender_id,
      receiverId: row.receiver_id,
      content:    row.content,
      type:       row.type,
      metadata:   row.metadata,
      status:     row.status,
      createdAt:  new Date(row.created_at),
    };
  };
}
