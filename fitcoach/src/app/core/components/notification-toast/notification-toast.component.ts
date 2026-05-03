import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('250ms cubic-bezier(0.4,0,0.2,1)',
          style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({ transform: 'translateY(-100%)', opacity: 0 }))
      ]),
    ])
  ],
  template: `
    @if (svc.activeToast(); as toast) {
      <div
        class="toast"
        [@toast]
        (click)="onTap(toast)"
        role="alert">
        <span class="toast-icon">{{ iconFor(toast.type) }}</span>
        <div class="toast-body">
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-msg">{{ toast.body }}</p>
        </div>
        <button class="toast-close" (click)="$event.stopPropagation(); svc.dismissToast()">
          ✕
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 12px);
      left: 12px; right: 12px;
      z-index: 9999;
      pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 12px;
      background: #13151e;
      border: 0.5px solid rgba(255,255,255,0.1);
      border-radius: 14px; padding: 12px 14px;
      box-shadow: 0 4px 24px rgba(0,0,0,.12);
      cursor: pointer; pointer-events: all;
    }
    .toast-icon { font-size: 22px; flex-shrink: 0; }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title {
      font-size: 13px; font-weight: 500;
      color: #fff;
      margin: 0 0 2px; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .toast-msg {
      font-size: 12px; color: #888780;
      margin: 0; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .toast-close {
      background: none; border: none;
      color: #5F5E5A;
      font-size: 12px; cursor: pointer;
      padding: 4px; flex-shrink: 0;
    }
  `]
})
export class NotificationToastComponent {
  readonly svc = inject(NotificationService);
  private router = inject(Router);

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      workout_completed: '🏋️',
      routine_assigned:  '📋',
      new_message:       '💬',
      coach_feedback:    '⭐',
    };
    return icons[type] ?? '🔔';
  }

  onTap(toast: any): void {
    this.svc.markRead(toast.id);
    this.svc.dismissToast();
    // Navegar según tipo
    const routes: Record<string, string> = {
      workout_completed: '/coach/dashboard',
      routine_assigned:  '/client/dashboard',
      new_message:       '/chat',
      coach_feedback:    '/client/progress',
    };
    this.router.navigate([routes[toast.type] ?? '/dashboard']);
  }
}
