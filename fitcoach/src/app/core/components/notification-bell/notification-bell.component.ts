import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="bell-btn" (click)="togglePanel()">
      <span class="bell-icon">🔔</span>
      @if (svc.unreadCount() > 0) {
        <span class="bell-badge">
          {{ svc.unreadCount() > 9 ? '9+' : svc.unreadCount() }}
        </span>
      }
    </button>

    @if (open()) {
      <div class="panel-backdrop" (click)="togglePanel()"></div>
      <div class="notif-panel">
        <div class="panel-header">
          <span class="panel-title">Notificaciones</span>
          @if (svc.unreadCount() > 0) {
            <button class="mark-all" (click)="svc.markAllRead()">
              Marcar todas leídas
            </button>
          }
        </div>

        @if (!svc.notifications().length) {
          <div class="empty-notifs">
            <span>🔔</span>
            <p>Sin notificaciones</p>
          </div>
        } @else {
          <div class="notif-list">
            @for (n of svc.notifications(); track n.id) {
              <div
                class="notif-item"
                [class.unread]="!n.read_at"
                (click)="onNotifClick(n)">
                <span class="notif-icon">{{ iconFor(n.type) }}</span>
                <div class="notif-body">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-msg">{{ n.body }}</p>
                  <p class="notif-time">{{ timeAgo(n.created_at) }}</p>
                </div>
                @if (!n.read_at) {
                  <span class="unread-dot"></span>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { position: relative; }
    .bell-btn {
      width: 36px; height: 36px; border-radius: 50%;
      border: 0.5px solid rgba(255,255,255,0.1);
      background: #13151e;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; position: relative; font-size: 16px;
    }
    .bell-badge {
      position: absolute; top: -4px; right: -4px;
      min-width: 18px; height: 18px;
      background: #E24B4A; color: #fff;
      font-size: 10px; font-weight: 500;
      border-radius: 9px; display: flex;
      align-items: center; justify-content: center;
      padding: 0 4px;
      border: 2px solid #0d0f18;
      animation: pop .2s ease-out;
    }
    .panel-backdrop {
      position: fixed; inset: 0; z-index: 200;
    }
    .notif-panel {
      position: absolute; right: 0; top: 44px;
      width: 320px; max-height: 420px;
      background: #13151e;
      border: 0.5px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
      z-index: 201; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px;
      border-bottom: 0.5px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .panel-title { font-size: 13px; font-weight: 500; color: #fff; }
    .mark-all { font-size: 11px; color: #1D9E75; background: none; border: none; cursor: pointer; }
    .notif-list { overflow-y: auto; flex: 1; }
    .notif-item {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 0.5px solid rgba(255,255,255,0.03);
      cursor: pointer; transition: background .1s;
      &:hover { background: rgba(255,255,255,0.02); }
      &.unread { background: rgba(29,158,117,0.05); }
    }
    .notif-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 500; color: #fff; margin: 0 0 2px; }
    .notif-msg   { font-size: 12px; color: #888780; margin: 0 0 4px; }
    .notif-time  { font-size: 11px; color: #5F5E5A; margin: 0; }
    .unread-dot  { width: 8px; height: 8px; border-radius: 50%; background: #1D9E75; flex-shrink: 0; margin-top: 5px; }
    .empty-notifs {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px; color: #5F5E5A;
      font-size: 13px;
      span { font-size: 28px; }
    }
    @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
  `]
})
export class NotificationBellComponent {
  readonly svc = inject(NotificationService);
  private router = inject(Router);
  open = signal(false);

  togglePanel() { this.open.update(v => !v); }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      workout_completed: '🏋️',
      routine_assigned:  '📋',
      new_message:       '💬',
      coach_feedback:    '⭐',
    };
    return icons[type] ?? '🔔';
  }

  onNotifClick(n: any) {
    this.svc.markRead(n.id);
    this.open.set(false);
    
    const routes: Record<string, string> = {
      workout_completed: '/coach/dashboard',
      routine_assigned:  '/client/dashboard',
      new_message:       '/chat',
      coach_feedback:    '/client/progress',
    };
    this.router.navigate([routes[n.type] ?? '/dashboard']);
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  }
}
