import { Injectable } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';
import { ChatMessage, Conversation, MessageType } from '../../state/chat.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private sb      = supabase;
  private channel: RealtimeChannel | null = null;

  // ── Realtime ──────────────────────────────────────────────────────

  subscribeToConversation(
    myId:      string,
    partnerId: string,
    onMessage: (msg: ChatMessage) => void
  ): void {
    this.unsubscribe();

    this.channel = this.sb
      .channel(`conv:${[myId, partnerId].sort().join('_')}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          // Filtramos en servidor para no recibir mensajes de otras convs.
          filter: `receiver_id=eq.${myId}`,
        },
        (payload) => {
          console.log('[Realtime] mensaje recibido:', payload);
          onMessage(this.mapRow(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'messages',
          filter: `sender_id=eq.${myId}`,
        },
        // Actualizar status (delivered/read) de mensajes propios
        (_payload) => { /* se puede emitir a un segundo callback */ }
      )
      .subscribe((status) => {
        console.log('[Realtime] estado del canal:', status);
      });
  }

  unsubscribe(): void {
    this.channel?.unsubscribe();
    this.channel = null;
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
          .single();

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
