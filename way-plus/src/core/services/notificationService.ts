/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Notification Service — Push amigables para terapia infantil
 * Respetuoso: no spamea, respeta horarios, y usa lenguaje gamificado
 * ═══════════════════════════════════════════════════════════════
 */

import { hapticService } from './hapticService';

// ─── TYPES ───
export type NotificationType = 'streak_at_risk' | 'new_level' | 'reminder' | 'reward_ready' | 'therapist_message';

export interface WayNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon: string;
  badge: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationSchedule {
  id: string;
  type: NotificationType;
  delayMs: number;
  repeat?: 'daily' | 'weekly';
}

// ─── CONFIG ───
const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  streak_at_risk: '/icons/notification-fire.png',
  new_level: '/icons/notification-star.png',
  reminder: '/icons/notification-bell.png',
  reward_ready: '/icons/notification-gift.png',
  therapist_message: '/icons/notification-heart.png',
};

const MESSAGES: Record<NotificationType, { title: string; body: string }[]> = {
  streak_at_risk: [
    { title: '🔥 ¡Tu racha te espera!', body: 'Tu personaje se pregunta dónde estás. ¡Vamos a jugar 5 minutos!' },
    { title: '✨ ¡No pierdas tu racha!', body: 'Llevas 2 días sin jugar. ¡Un nivel rápido y sigues avanzando!' },
  ],
  new_level: [
    { title: '🎉 ¡Nuevo nivel desbloqueado!', body: 'El Bosque Encantado te espera. ¿Te atreves a explorarlo?' },
  ],
  reminder: [
    { title: '🌈 Hora de tu aventura', body: 'Tu terapeuta dejó una nueva misión para ti. ¡Descúbrela!' },
    { title: '🎯 ¡Es hora de jugar!', body: 'Recuerda: 10 minutos de juego = superpoderes para tu mente.' },
  ],
  reward_ready: [
    { title: '🎁 ¡Tienes un regalo!', body: 'Abre tu cofre diario y descubre qué sorpresa te espera.' },
  ],
  therapist_message: [
    { title: '💬 Mensaje de tu terapeuta', body: 'Te ha enviado un nuevo comentario. ¡Míralo!' },
  ],
};

// ─── SERVICE ───
class NotificationService {
  private permission: NotificationPermission = 'default';
  private scheduled: Map<string, number> = new Map(); // timeout IDs

  async init(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[WAY+] Notifications not supported');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      // No pedimos inmediatamente. Esperamos a que el usuario tenga contexto.
      return false;
    }

    return this.permission === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    const result = await Notification.requestPermission();
    this.permission = result;

    if (result === 'granted') {
      hapticService.success();
      this.sendWelcome();
    }

    return result === 'granted';
  }

  private sendWelcome(): void {
    this.show({
      id: 'welcome',
      type: 'reminder',
      title: '✨ ¡Bienvenido a WAY+!',
      body: 'Te avisaremos cuando haya nuevas aventuras. Puedes cambiar esto en configuración.',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      requireInteraction: false,
    });
  }

  show(notification: WayNotification): void {
    if (this.permission !== 'granted') return;

    const icon = notification.icon || NOTIFICATION_ICONS[notification.type];
    const badge = notification.badge || '/icon-96.png';

    // Usar el Service Worker para notificaciones robustas (funciona en background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          ...notification,
          icon,
          badge,
          tag: notification.id,
          renotify: true,
          requireInteraction: notification.requireInteraction ?? false,
          actions: notification.actions || this.getDefaultActions(notification.type),
        },
      });
    } else {
      // Fallback: notification nativa (solo foreground)
      new Notification(notification.title, {
        body: notification.body,
        icon,
        badge,
        tag: notification.id,
        requireInteraction: notification.requireInteraction ?? false,
        actions: notification.actions || this.getDefaultActions(notification.type),
      });
    }
  }

  private getDefaultActions(type: NotificationType): NotificationAction[] {
    switch (type) {
      case 'streak_at_risk':
      case 'reminder':
        return [
          { action: 'play', title: 'Jugar ahora 🎮' },
          { action: 'later', title: 'Más tarde' },
        ];
      case 'reward_ready':
        return [
          { action: 'claim', title: 'Abrir 🎁' },
          { action: 'dismiss', title: 'Después' },
        ];
      case 'therapist_message':
        return [
          { action: 'view', title: 'Ver mensaje 💬' },
        ];
      default:
        return [];
    }
  }

  // ─── SCHEDULING ───

  schedule(schedule: NotificationSchedule): string {
    this.cancel(schedule.id);

    const timeoutId = window.setTimeout(() => {
      const messages = MESSAGES[schedule.type];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      
      this.show({
        id: schedule.id,
        type: schedule.type,
        title: msg.title,
        body: msg.body,
        icon: NOTIFICATION_ICONS[schedule.type],
        badge: '/icon-96.png',
      });

      // Si es recurrente, reprogramar
      if (schedule.repeat === 'daily') {
        this.schedule({ ...schedule, delayMs: 24 * 60 * 60 * 1000 });
      } else if (schedule.repeat === 'weekly') {
        this.schedule({ ...schedule, delayMs: 7 * 24 * 60 * 60 * 1000 });
      }
    }, schedule.delayMs);

    this.scheduled.set(schedule.id, timeoutId);
    return schedule.id;
  }

  cancel(id: string): void {
    const timeoutId = this.scheduled.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      this.scheduled.delete(id);
    }
  }

  cancelAll(): void {
    this.scheduled.forEach((id) => window.clearTimeout(id));
    this.scheduled.clear();
  }

  // ─── SMART SCHEDULES (terapia infantil) ───

  /** Recordatorio si no juega en X días */
  scheduleStreakReminder(daysWithoutPlay: number = 2): string {
    const delay = daysWithoutPlay * 24 * 60 * 60 * 1000;
    return this.schedule({
      id: 'streak-reminder',
      type: 'streak_at_risk',
      delayMs: delay,
      repeat: 'daily',
    });
  }

  /** Recordatorio diario a hora específica (ej. 16:00) */
  scheduleDailyReminder(hour: number = 16, minute: number = 0): string {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    if (target <= now) target.setDate(target.getDate() + 1);
    
    const delay = target.getTime() - now.getTime();
    
    return this.schedule({
      id: 'daily-reminder',
      type: 'reminder',
      delayMs: delay,
      repeat: 'daily',
    });
  }

  /** Notificación cuando hay cofre disponible */
  notifyRewardReady(): void {
    this.show({
      id: 'reward-ready',
      type: 'reward_ready',
      title: '🎁 ¡Cofre diario listo!',
      body: 'Ven a abrirlo antes de que desaparezca.',
      requireInteraction: false,
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  isGranted(): boolean {
    return this.permission === 'granted';
  }
}

export const notificationService = new NotificationService();
