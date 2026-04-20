import {
  signalStore, withState, withComputed,
  withMethods, patchState, withHooks
} from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { ChatService }  from '../core/services/chat.service';
import { AuthService }  from '../core/auth/auth.service';
import { WorkoutEventsService } from '../core/services/workout-events.service';

export type MessageType = 'text' | 'system' | 'routine_card' | 'photo';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id:         string;
  senderId:   string;
  receiverId: string;
  content:    string;
  type:       MessageType;
  metadata?:  Record<string, any>;   // routineId, photoUrl, etc.
  status:     MessageStatus;
  createdAt:  Date;
  // calculado en cliente, no en DB
  isOwn?:     boolean;
}

export interface Conversation {
  partnerId:   string;
  partnerName: string;
  lastMessage: string;
  lastTime:    Date;
  unread:      number;
}

interface ChatState {
  conversations: Conversation[];
  messages:      ChatMessage[];
  activePartnerId: string | null;
  sending:       boolean;
  loadingHistory: boolean;
}

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState<ChatState>({
    conversations:   [],
    messages:        [],
    activePartnerId: null,
    sending:         false,
    loadingHistory:  false,
  }),

  withComputed(({ messages, activePartnerId, conversations }) => ({

    activeMessages: computed(() => messages()),

    unreadTotal: computed(() =>
      conversations().reduce((sum, c) => sum + c.unread, 0)
    ),

    activeConversation: computed(() =>
      conversations().find(c => c.partnerId === activePartnerId()) ?? null
    ),
  })),

  withMethods((
    store,
    chatSvc = inject(ChatService),
    auth    = inject(AuthService)
  ) => ({

    // ── Abrir una conversación ────────────────────────────────────────
    async openConversation(partnerId: string): Promise<void> {
      patchState(store, {
        activePartnerId: partnerId,
        messages:        [],
        loadingHistory:  true,
      });

      const myId    = auth.profile()!.id;
      const history = await chatSvc.getHistory(myId, partnerId);

      // Marcar como leídos los mensajes recibidos
      const unread = history.filter(
        m => m.receiverId === myId && m.status !== 'read'
      );
      if (unread.length) {
        await chatSvc.markAsRead(unread.map(m => m.id));
      }

      const withOwn = history.map(m => ({ ...m, isOwn: m.senderId === myId }));

      patchState(store, {
        messages:       withOwn,
        loadingHistory: false,
        // Resetear unread de esta conversación
        conversations: store.conversations().map(c =>
          c.partnerId === partnerId ? { ...c, unread: 0 } : c
        ),
      });

      // Suscribirse a mensajes nuevos en tiempo real
      chatSvc.subscribeToConversation(myId, partnerId, (msg) => {
        const owned = { ...msg, isOwn: msg.senderId === myId };
        patchState(store, {
          messages: [...store.messages(), owned],
        });
        // Marcar como leído inmediatamente si estamos en esta conversación
        if (msg.receiverId === myId) {
          chatSvc.markAsRead([msg.id]);
        }
      });
    },

    // ── Enviar mensaje de texto ───────────────────────────────────────
    async sendText(content: string): Promise<void> {
      const myId      = auth.profile()!.id;
      const partnerId = store.activePartnerId();
      if (!partnerId || !content.trim()) return;

      patchState(store, { sending: true });

      // Optimistic update: añadir el mensaje al store antes de la respuesta
      const optimistic: ChatMessage = {
        id:         crypto.randomUUID(),
        senderId:   myId,
        receiverId: partnerId,
        content:    content.trim(),
        type:       'text',
        status:     'sent',
        createdAt:  new Date(),
        isOwn:      true,
      };
      patchState(store, { messages: [...store.messages(), optimistic] });

      try {
        await chatSvc.sendMessage(myId, partnerId, content.trim(), 'text');
      } finally {
        patchState(store, { sending: false });
      }
    },

    // ── Enviar rutina como card ───────────────────────────────────────
    async sendRoutineCard(routineId: string, routineName: string): Promise<void> {
      const myId      = auth.profile()!.id;
      const partnerId = store.activePartnerId();
      if (!partnerId) return;

      await chatSvc.sendMessage(
        myId, partnerId,
        `He asignado la rutina "${routineName}"`,
        'routine_card',
        { routineId, routineName }
      );
    },

    // ── Mensaje de sistema (llamado por WorkoutStore al completar) ────
    async sendSystemMessage(
      clientId: string,
      coachId:  string,
      content:  string
    ): Promise<void> {
      await chatSvc.sendMessage(clientId, coachId, content, 'system');
    },

    // ── Cargar lista de conversaciones del coach ──────────────────────
    async loadConversations(coachId: string): Promise<void> {
      const convs = await chatSvc.getCoachConversations(coachId);
      patchState(store, { conversations: convs });
    },

    closeConversation(): void {
      chatSvc.unsubscribe();
      patchState(store, { activePartnerId: null, messages: [] });
    },
  })),
);
