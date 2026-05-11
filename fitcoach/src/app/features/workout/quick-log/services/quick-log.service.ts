import { Injectable, signal, computed, effect } from '@angular/core';
import { QuickLogState, SetInputConfig } from '../models/quick-log.model';

@Injectable({ providedIn: 'root' })
export class QuickLogService {
  // Estado reactivo con Signals (Angular 19)
  private state = signal<QuickLogState | null>(null);
  
  // Persistencia en sessionStorage para warm reload
  private readonly STORAGE_KEY = 'fitcoach_quicklog';
  
  // Incrementos estándar de gimnasio
  readonly weightIncrements = [-10, -5, -2.5, 2.5, 5, 10];
  readonly repIncrements = [-5, -2, -1, 1, 2, 5];

  // Computed: sugerir peso basado en historial
  readonly suggestedWeight = computed(() => {
    const s = this.state();
    return s ? s.lastWeight : null;
  });

  readonly suggestedReps = computed(() => {
    const s = this.state();
    return s ? s.lastReps : null;
  });

  constructor() {
    // Recuperar de sessionStorage al iniciar
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Solo recuperar si es de la última hora
        if (Date.now() - parsed.timestamp < 3600000) {
          this.state.set(parsed);
        }
      } catch {}
    }

    // Auto-persistir cambios
    effect(() => {
      const current = this.state();
      if (current) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          ...current,
          timestamp: Date.now()
        }));
      }
    });
  }

  /**
   * Guardar última serie registrada
   */
  saveLastSet(exerciseId: string, weight: number, reps: number, setIndex: number): void {
    this.state.set({
      exerciseId,
      lastWeight: weight,
      lastReps: reps,
      lastSetIndex: setIndex,
      timestamp: Date.now()
    });
  }

  /**
   * Calcular peso ajustado con redondeo a 0.5kg (estándar placas)
   */
  adjustWeight(current: number, delta: number): number {
    const raw = current + delta;
    // Redondear a múltiplo de 0.5 (placas estándar)
    return Math.max(0, Math.round(raw * 2) / 2);
  }

  /**
   * Calcular reps ajustadas (nunca negativas)
   */
  adjustReps(current: number, delta: number): number {
    return Math.max(0, current + delta);
  }

  /**
   * Verificar si podemos sugerir "misma serie anterior"
   */
  canSuggestCopy(config: SetInputConfig): boolean {
    const s = this.state();
    if (!s) return false;
    return s.exerciseId === config.exerciseId && 
           s.lastSetIndex === config.setIndex - 1;
  }

  /**
   * Limpiar estado al finalizar entrenamiento
   */
  clear(): void {
    this.state.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
