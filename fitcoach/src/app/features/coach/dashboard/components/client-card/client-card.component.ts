import { Component, Input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { UnreadMessagesService } from '../../../../messages/unread-messages.service';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <a class="client-card" [routerLink]="['/coach/client', client.id]">

      <!-- Avatar + badge no leídos -->
      <div class="avatar-wrap">
        <div class="avatar" [class.active]="client.activeToday">
          {{ initials() }}
        </div>
        @if (unread() > 0) {
          <span class="unread-badge">{{ unread() > 9 ? '9+' : unread() }}</span>
        }
      </div>

      <!-- Info -->
      <div class="client-info">
        <span class="client-name">{{ client.full_name || client.name }}</span>
        <span class="client-sub">{{ client.activeRoutine ?? 'Sin rutina' }}</span>
      </div>

      <!-- Estado derecho -->
      <div class="client-right">
        <span class="adherence" [class.high]="(client.adherence ?? 0) >= 80" [class.low]="(client.adherence ?? 0) < 60">
          {{ client.adherence ?? 0 }}%
        </span>
        <span class="last-active">{{ (client.lastWorkout || client.lastActive) | date:'d MMM' : '' : 'es' }}</span>
      </div>

    </a>
  `,
  styles: [`
    .client-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 0.5px solid rgba(255,255,255,0.05);
      text-decoration: none;
      color: inherit;
      transition: background 0.1s;
      cursor: pointer;
    }
    .client-card:hover { background: rgba(255,255,255,0.03); }

    .avatar-wrap { position: relative; flex-shrink: 0; }

    .avatar {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 500;
      color: #888;
      border: 0.5px solid rgba(255,255,255,0.1);
    }
    .avatar.active {
      background: #0d2d1e;
      color: #1D9E75;
      border-color: #1D9E75;
    }

    .unread-badge {
      position: absolute;
      top: -3px; right: -3px;
      min-width: 18px; height: 18px;
      background: #E24B4A;
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
      border: 2px solid #000;
      animation: pop 0.2s ease-out;
    }

    @keyframes pop {
      0%   { transform: scale(0); }
      70%  { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .client-info {
      flex: 1;
      display: flex; flex-direction: column; gap: 2px;
    }
    .client-name { font-size: 14px; font-weight: 500; color: white; }
    .client-sub  { font-size: 12px; color: #666; }

    .client-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
    }
    .adherence { font-size: 14px; font-weight: 500; }
    .adherence.high { color: #1D9E75; }
    .adherence.low  { color: #E24B4A; }
    .last-active { font-size: 11px; color: #444; }
  `]
})
export class ClientCardComponent {
  @Input({ required: true }) client!: any;

  private unreadSvc = inject(UnreadMessagesService);

  unread = computed(() => this.unreadSvc.unread()[this.client.id] ?? 0);

  initials = computed(() => {
    const name = this.client.full_name || this.client.name || 'Atleta';
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });
}
