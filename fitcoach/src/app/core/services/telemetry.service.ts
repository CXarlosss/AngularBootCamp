import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private sb = supabase;
  private auth = inject(AuthService);
  
  // Identificador único de la sesión actual
  private readonly SESSION_ID = crypto.randomUUID();
  
  // Buffer para envío por lotes (batching)
  private buffer: any[] = [];
  private readonly BUFFER_SIZE = 10;
  private flushTimer: any;

  /**
   * Trackea un evento de usuario
   * @param eventName Nombre del evento (snake_case recomendado)
   * @param properties Metadatos adicionales
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    console.log('[Telemetry] Tracking:', eventName, properties);

    const event = {
      user_id: this.auth.user()?.id, // Crítico para RLS
      event_name: eventName,
      properties: {
        ...properties,
        session_id: this.SESSION_ID,
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        url: window.location.href
      },
      timestamp: new Date().toISOString()
    };
    
    this.buffer.push(event);
    
    // Flush inmediato si es un evento crítico
    const criticalEvents = ['set_saved', 'workout_completed', 'undo_triggered', 'mission_xp_claimed'];
    if (criticalEvents.includes(eventName)) {
      console.log('[Telemetry] Immediate flush for:', eventName);
      this.flush();
    } else if (this.buffer.length >= this.BUFFER_SIZE) {
      this.flush();
    } else {
      // Flush diferido para eventos menores (ej. ajustes de peso individuales)
      clearTimeout(this.flushTimer);
      this.flushTimer = setTimeout(() => this.flush(), 5000);
    }
  }

  /**
   * Envía los eventos acumulados a Supabase
   */
  private async flush(): Promise<void> {
    console.log('[Telemetry] Flushing buffer:', this.buffer.length, 'events');
    
    if (this.buffer.length === 0) return;
    
    const batch = [...this.buffer];
    this.buffer = [];
    
    try {
      const { error } = await this.sb.from('analytics_events').insert(batch);
      if (error) throw error;
      console.log('[Telemetry] Flush successful');
    } catch (err) {
      console.error('[Telemetry] Flush failed:', err);
      // Re-insertar en el buffer si falló (retry logic)
      this.buffer = [...batch, ...this.buffer];
    }
  }
}

