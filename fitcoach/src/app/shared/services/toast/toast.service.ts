import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'unlock' | 'error';

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message: string;
  emoji:   string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, title: string, message = '', duration = 3000) {
    const id = crypto.randomUUID();
    const emojis: Record<ToastType, string> = {
      success: '✅',
      info:    'ℹ️',
      unlock:  '🔓',
      error:   '❌',
    };

    const toast: Toast = { id, type, title, message, emoji: emojis[type] };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  // Helpers rápidos
  success(title: string, msg = '')   { this.show('success', title, msg); }
  info   (title: string, msg = '')   { this.show('info',    title, msg); }
  unlock (title: string, msg = '')   { this.show('unlock',  title, msg, 4000); }
  error  (title: string, msg = '')   { this.show('error',   title, msg); }
}
