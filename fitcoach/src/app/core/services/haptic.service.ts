import { Injectable } from '@angular/core';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'complete';

@Injectable({ providedIn: 'root' })
export class HapticService {
  private readonly patterns: Record<HapticPattern, number | number[]> = {
    light:    15,           // Micro-feedback al tocar botones
    medium:   40,           // Al abrir modal o cambiar estado
    heavy:    80,           // Al completar ejercicio
    success:  [40, 30, 60], // Patrón: tick-tick-tick ✓
    error:    [80, 40, 80], // Patrón: buzz-buzz (X)
    complete: [50, 50, 100, 50, 150] // Celebración al terminar workout
  };

  private get supportsVibration(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  trigger(pattern: HapticPattern): void {
    if (!this.supportsVibration) return;
    
    try {
      const duration = this.patterns[pattern];
      navigator.vibrate(duration);
    } catch {
      // Ignorar fallos en navegadores que lo reportan pero bloquean
    }
  }

  /** Vibra solo si el dispositivo está en modo "interactivo" (no silencioso) */
  triggerIfAllowed(pattern: HapticPattern): boolean {
    if (!this.supportsVibration) return false;
    
    try {
      return navigator.vibrate(this.patterns[pattern]);
    } catch {
      return false;
    }
  }
}
