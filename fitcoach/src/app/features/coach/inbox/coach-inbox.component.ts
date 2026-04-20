import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatStore, Conversation } from '../../../state/chat.store';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatWindowComponent } from '../../shared/chat/chat-window.component';

@Component({
  selector: 'fc-coach-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChatWindowComponent],
  template: `
    <div class="inbox-layout">

      <!-- ── Lista de conversaciones ── -->
      <aside class="conv-list">
        <div class="conv-list-header">
          <h2 class="inbox-title">Mensajes</h2>
          @if (store.unreadTotal() > 0) {
            <span class="unread-badge">{{ store.unreadTotal() }}</span>
          }
        </div>

        @for (conv of store.conversations(); track conv.partnerId) {
          <div
            class="conv-item"
            [class.active]="selected()?.partnerId === conv.partnerId"
            (click)="select(conv)"
          >
            <div class="conv-av">{{ initials(conv.partnerName) }}</div>
            <div class="conv-info">
              <div class="conv-top">
                <span class="conv-name">{{ conv.partnerName }}</span>
                <span class="conv-time">
                  {{ formatTime(conv.lastTime) }}
                </span>
              </div>
              <div class="conv-bottom">
                <span class="conv-last">{{ conv.lastMessage }}</span>
                @if (conv.unread > 0) {
                  <span class="conv-unread">{{ conv.unread }}</span>
                }
              </div>
            </div>
          </div>
        }

        @if (store.conversations().length === 0) {
          <div class="no-convs">
            Aún no tienes clientes vinculados.
          </div>
        }
      </aside>

      <!-- ── Ventana de chat activa ── -->
      <main class="chat-main">
        @if (selected()?.partnerId) {
          <fc-chat-window
            [partnerId]="selected()!.partnerId"
            [partnerName]="selected()!.partnerName"
          />
        } @else {
          <div class="no-chat-selected">
            <p>Selecciona una conversación para empezar</p>
          </div>
        }
      </main>

    </div>
  `,
  styleUrl: '../../shared/chat/chat.css'
})
export class CoachInboxComponent implements OnInit {
  store    = inject(ChatStore);
  auth     = inject(AuthService);
  selected = signal<Conversation | null>(null);

  async ngOnInit(): Promise<void> {
    await this.store.loadConversations(this.auth.profile()!.id);
  }

  select(conv: Conversation): void {
    this.selected.set(conv);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  formatTime(date: Date): string {
    if (!date || date.getTime() === 0) return '';
    const now  = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('es-ES', { weekday: 'short' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
