import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast/toast.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ transform: 'translateX(110%)', opacity: 0 }),
        animate('280ms cubic-bezier(0.4,0,0.2,1)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('220ms ease-in',
          style({ transform: 'translateX(110%)', opacity: 0 }))
      ]),
    ])
  ],
  template: `
    <div class="toast-wrap">
      @for (toast of svc.toasts(); track toast.id) {
        <div
          class="toast toast-{{ toast.type }}"
          [@toast]
          (click)="svc.dismiss(toast.id)">
          <span class="toast-emoji">{{ toast.emoji }}</span>
          <div class="toast-body">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-msg">{{ toast.message }}</p>
            }
          </div>
          <button class="toast-close" (click)="$event.stopPropagation(); svc.dismiss(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrap {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 12px);
      right: 12px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
      max-width: calc(100vw - 24px);
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 12px;
      border: 0.5px solid var(--c-border);
      background: var(--c-surface);
      box-shadow: var(--c-shadow);
      cursor: pointer;
      pointer-events: all;
      min-width: 260px;
      max-width: 340px;

      &.toast-success { border-color: rgba(29,158,117,.4); }
      &.toast-unlock  { border-color: rgba(217,119,6,.4); }
      &.toast-error   { border-color: rgba(220,38,38,.4); }
      &.toast-info    { border-color: rgba(55,138,221,.4); }
    }

    .toast-emoji { font-size: 20px; flex-shrink: 0; }

    .toast-body { flex: 1; min-width: 0; }

    .toast-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--c-text-1);
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-msg {
      font-size: 11px;
      color: var(--c-text-3);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--c-text-4);
      font-size: 11px;
      cursor: pointer;
      padding: 2px;
      flex-shrink: 0;
      opacity: .6;
      &:hover { opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  readonly svc = inject(ToastService);
}
