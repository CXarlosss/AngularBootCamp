import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatStore } from './state/chat.store';
import { WorkoutEventsService } from './core/services/workout-events.service';
import { ChatService } from './core/services/chat.service';
import { TelemetryService } from './core/services/telemetry.service';
import { SyncQueueService } from './core/services/sync-queue.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit, OnDestroy {
  private chatStore    = inject(ChatStore);
  private events       = inject(WorkoutEventsService);
  private chatService  = inject(ChatService);
  private telemetry    = inject(TelemetryService);
  private syncQueue    = inject(SyncQueueService);
  private themeService = inject(ThemeService);

  private sessionId = crypto.randomUUID();
  private sessionStartTime = Date.now();
  private visibilityHandler = () => this.handleVisibilityChange();

  async ngOnInit() {
    this.themeService.loadPreference();

    // 1. RECUPERACIÓN DE SESIÓN ANTERIOR
    if (navigator.onLine) {
      await this.syncQueue.flushPending();
    }
    
    // 2. TELEMETRY: app_opened
    this.telemetry.track('app_opened', {
      session_id: this.sessionId,
      timestamp: this.sessionStartTime,
      device_type: this.detectDeviceType(),
      referrer: document.referrer || 'direct'
    });
    
    // 3. REGISTRAR VISIBILITY CHANGE
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Suscribir el chat a los eventos de workout completado
    this.events.workoutCompleted$.subscribe(async (event) => {
      const volume = Math.round(event.totalVolume).toLocaleString('es-ES');
      await this.chatService.sendMessage(
        event.clientId,
        event.coachId,
        `${event.clientName} completó un entrenamiento — ${event.totalSets} series · ${volume} kg de volumen`,
        'system'
      );
    });
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.telemetry.track('app_closed', {
        session_id: this.sessionId,
        session_duration_ms: Date.now() - this.sessionStartTime,
        timestamp: Date.now()
      });
      
      if (navigator.onLine) {
        this.syncQueue.attemptUrgentFlush().catch(() => {
          // Fallback a IndexedDB
        });
      }
    }
  }

  private detectDeviceType(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    return 'desktop';
  }
}
