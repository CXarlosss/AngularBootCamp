/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Frustration Detector — IA local de comportamiento
 * Analiza: velocidad de error, movimientos erráticos, abandono,
 * repeticiones, tiempo de respuesta. Zero dependencias externas.
 * ═══════════════════════════════════════════════════════════════
 */

export interface InteractionEvent {
  type: 'tap' | 'drag' | 'hold' | 'error' | 'help' | 'pause' | 'resume';
  timestamp: number;
  position?: { x: number; y: number };
  targetId?: string;
  durationMs?: number;
}

export interface FrustrationMetrics {
  score: number; // 0-100
  level: 'calm' | 'alert' | 'frustrated' | 'overwhelmed';
  confidence: number; // 0-1
  triggers: string[];
  recommendation: 'maintain' | 'ease' | 'pause' | 'encourage';
}

const WINDOW_MS = 30000; // Ventana de análisis: 30 segundos
const MAX_EVENTS = 50;

class FrustrationDetector {
  private events: InteractionEvent[] = [];
  private lastAlertTime = 0;

  record(event: InteractionEvent) {
    this.events.push(event);
    this.events = this.events.filter((e) => event.timestamp - e.timestamp < WINDOW_MS);
    if (this.events.length > MAX_EVENTS) this.events.shift();
  }

  analyze(): FrustrationMetrics {
    const now = Date.now();
    const windowEvents = this.events.filter((e) => now - e.timestamp < WINDOW_MS);

    if (windowEvents.length < 3) {
      return { score: 0, level: 'calm', confidence: 0, triggers: [], recommendation: 'maintain' };
    }

    let score = 0;
    const triggers: string[] = [];
    const errors = windowEvents.filter((e) => e.type === 'error');
    const helps = windowEvents.filter((e) => e.type === 'help');
    const pauses = windowEvents.filter((e) => e.type === 'pause');

    // 1. Tasa de error (> 40% en ventana = frustración)
    const errorRate = errors.length / windowEvents.length;
    if (errorRate > 0.5) {
      score += 35;
      triggers.push('error_rate_high');
    } else if (errorRate > 0.3) {
      score += 20;
      triggers.push('error_rate_elevated');
    }

    // 2. Errores seguidos (3+ consecutivos)
    let consecutiveErrors = 0;
    let maxConsecutive = 0;
    for (const e of windowEvents) {
      if (e.type === 'error') {
        consecutiveErrors++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveErrors);
      } else {
        consecutiveErrors = 0;
      }
    }
    if (maxConsecutive >= 4) {
      score += 30;
      triggers.push('consecutive_errors_4plus');
    } else if (maxConsecutive >= 3) {
      score += 15;
      triggers.push('consecutive_errors_3');
    }

    // 3. Ayudas solicitadas (> 2 = posible bloqueo)
    if (helps.length >= 3) {
      score += 15;
      triggers.push('repeated_help_requests');
    }

    // 4. Pausas repentinas (abandono momentáneo)
    if (pauses.length >= 2) {
      score += 10;
      triggers.push('frequent_pauses');
    }

    // 5. Velocidad de interacción errática (tocar muy rápido sin sentido)
    const taps = windowEvents.filter((e) => e.type === 'tap');
    if (taps.length >= 5) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i].timestamp - taps[i - 1].timestamp);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 400) {
        // Tocando frenéticamente cada < 400ms
        score += 15;
        triggers.push('erratic_tapping');
      }
    }

    // 6. Tiempo desde último éxito (si > 20s sin éxito)
    const successes = windowEvents.filter((e) => e.type === 'tap' && !errors.find((err) => err.timestamp === e.timestamp));
    // Simplificación: si no hay éxito reciente en ventana
    if (successes.length === 0 && windowEvents.length > 5) {
      score += 10;
      triggers.push('no_recent_success');
    }

    score = Math.min(100, score);
    const confidence = Math.min(1, windowEvents.length / 10);

    let level: FrustrationMetrics['level'] = 'calm';
    let recommendation: FrustrationMetrics['recommendation'] = 'maintain';

    if (score >= 70) {
      level = 'overwhelmed';
      recommendation = 'pause';
    } else if (score >= 50) {
      level = 'frustrated';
      recommendation = 'ease';
    } else if (score >= 30) {
      level = 'alert';
      recommendation = 'encourage';
    }

    // Evitar spam de alertas: cooldown de 8 segundos entre intervenciones
    if (now - this.lastAlertTime < 8000 && level !== 'calm') {
      recommendation = 'maintain';
    } else if (level !== 'calm') {
      this.lastAlertTime = now;
    }

    return { score, level, confidence, triggers, recommendation };
  }

  reset() {
    this.events = [];
    this.lastAlertTime = 0;
  }
}

export const frustrationDetector = new FrustrationDetector();
