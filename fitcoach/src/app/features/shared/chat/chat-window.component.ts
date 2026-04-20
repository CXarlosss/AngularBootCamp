import {
  Component, inject, signal, ViewChild,
  ElementRef, AfterViewChecked,
  ChangeDetectionStrategy, OnInit, OnDestroy, input
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatStore, ChatMessage } from '../../../state/chat.store';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'fc-chat-window',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="chat-window">

      <!-- ── Header ── -->
      <div class="chat-header">
        <div class="chat-av">{{ initials(partnerName()) }}</div>
        <div class="chat-header-info">
          <span class="chat-partner-name">{{ partnerName() }}</span>
          <span class="chat-status">En línea</span>
        </div>
      </div>

      <!-- ── Mensajes ── -->
      <div class="messages-area" #scrollArea>

        @if (store.loadingHistory()) {
          <div class="loading-msgs">
            <div class="skeleton-msg"></div>
            <div class="skeleton-msg own"></div>
            <div class="skeleton-msg"></div>
          </div>
        }

        @for (msg of store.activeMessages(); track msg.id) {
          @switch (msg.type) {

            @case ('text') {
              <div class="bubble-wrap" [class.own]="msg.isOwn">
                <div class="bubble" [class.own]="msg.isOwn">
                  <p class="bubble-text">{{ msg.content }}</p>
                  <div class="bubble-meta">
                    <span class="bubble-time">
                      {{ msg.createdAt | date:'HH:mm' }}
                    </span>
                    @if (msg.isOwn) {
                      <span class="read-ticks" [class.read]="msg.status === 'read'">
                        ✓✓
                      </span>
                    }
                  </div>
                </div>
              </div>
            }

            @case ('system') {
              <div class="system-msg">
                <span>{{ msg.content }}</span>
              </div>
            }

            @case ('routine_card') {
              <div class="bubble-wrap" [class.own]="msg.isOwn">
                <div class="routine-card-msg">
                  <div class="rc-icon">📋</div>
                  <div class="rc-body">
                    <p class="rc-title">Rutina asignada</p>
                    <p class="rc-name">{{ msg.metadata?.['routineName'] }}</p>
                  </div>
                  <button class="rc-btn" (click)="openRoutine(msg.metadata?.['routineId'])">
                    Ver
                  </button>
                </div>
              </div>
            }

            @case ('photo') {
              <div class="bubble-wrap" [class.own]="msg.isOwn">
                <div class="photo-msg">
                  <img
                    [src]="msg.metadata?.['photoUrl']"
                    alt="Foto de progreso"
                    loading="lazy"
                    class="photo-preview"
                  />
                  <p class="photo-caption">{{ msg.content }}</p>
                </div>
              </div>
            }
          }
        }

        <div #bottomAnchor></div>
      </div>

      <!-- ── Input ── -->
      <div class="chat-input-area">
        <input
          #msgInput
          type="text"
          class="chat-input"
          placeholder="Escribe un mensaje..."
          [(ngModel)]="draft"
          (keydown.enter)="send()"
          [disabled]="store.sending()"
          maxlength="1000"
        />
        <button
          class="send-btn"
          [disabled]="!draft.trim() || store.sending()"
          (click)="send()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

    </div>
  `,
  styleUrl: './chat.css'
})
export class ChatWindowComponent implements OnInit, AfterViewChecked, OnDestroy {
  store       = inject(ChatStore);
  auth        = inject(AuthService);

  partnerId   = input.required<string>();
  partnerName = input.required<string>();

  draft = '';
  private shouldScroll = false;

  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;
  @ViewChild('msgInput')     msgInput!: ElementRef<HTMLInputElement>;

  async ngOnInit(): Promise<void> {
    await this.store.openConversation(this.partnerId());
    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.bottomAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.store.closeConversation();
  }

  async send(): Promise<void> {
    if (!this.draft.trim()) return;
    const text  = this.draft;
    this.draft  = '';
    this.shouldScroll = true;
    await this.store.sendText(text);
    this.msgInput?.nativeElement.focus();
  }

  openRoutine(routineId: string): void {
    // Navegar a la vista de la rutina
    console.log('open routine', routineId);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
