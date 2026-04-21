import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router }             from '@angular/router';
import { CommonModule }       from '@angular/common';
import { ChatWindowComponent } from '../../shared/chat/chat-window.component';

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

      <nav class="bottom-nav">
        <button class="nav-btn" (click)="router.navigate(['/client/dashboard'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Inicio</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/workout'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4"/>
          </svg>
          <span>Entreno</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/progress'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <span>Progreso</span>
        </button>
        <button class="nav-btn active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Chat</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .chat-screen {
      display: flex;
      flex-direction: column;
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
      height: 100%;
      width: 100%;
    }
  `]
})
export class ClientChatComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);

  coachId   = signal<string | null>(null);
  coachName = signal<string>('Tu entrenador');

  async ngOnInit(): Promise<void> {
    const profile = this.auth.profile();
    if (profile?.coachId) {
      this.coachId.set(profile.coachId);
    }
  }
}
