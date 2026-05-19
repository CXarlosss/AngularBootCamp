import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router }             from '@angular/router';
import { CommonModule }       from '@angular/common';
import { ChatWindowComponent } from '../../shared/chat/chat-window.component';
import { UnreadMessagesService } from '../../messages/unread-messages.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'fc-client-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChatWindowComponent],
  template: `
    <div class="chat-screen">
      <div class="chat-main">
        @if (coachId() && coachName()) {
          <fc-chat-window
            [partnerId]="coachId()!"
            [partnerName]="coachName()!"
          />
        } @else {
          <div class="loading-state">
            Cargando chat...
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
    }
    .chat-screen {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      background: var(--c-bg);
    }
    .chat-main {
      flex: 1;
      height: 0; /* Permite que el flex-grow funcione correctamente con overflow interno */
      display: flex;
      flex-direction: column;
    }
    .loading-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-text-4);
      font-size: 13px;
    }
    fc-chat-window {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      width: 100%;
    }
  `]
})
export class ClientChatComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  unreadSvc = inject(UnreadMessagesService);

  coachId   = signal<string | null>(null);
  coachName = signal<string>('Tu entrenador');

  async ngOnInit(): Promise<void> {
    const profile = this.auth.profile();
    if (profile?.coachId) {
      this.loadChat(profile);
    } else {
      const sub = toObservable(this.auth.profile).subscribe(p => {
        if (p?.coachId) {
          this.loadChat(p);
          sub.unsubscribe();
        }
      });
    }
  }

  private async loadChat(profile: any): Promise<void> {
    this.coachId.set(profile.coachId);
    // Marcar mensajes del coach como leídos
    await this.unreadSvc.markAsRead(profile.id, profile.coachId);
  }
}
