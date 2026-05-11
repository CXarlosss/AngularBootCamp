import { Injectable } from '@angular/core';
import { ValidationResult } from '../models/quick-log.model';

interface ExerciseLimits {
  min: number;
  max: number;
  step: number;
  worldRecord?: number;
  category: 'compound' | 'isolation' | 'bodyweight';
}

@Injectable({ providedIn: 'root' })
export class ExerciseValidationService {
  // Límites basados en percentiles mundiales (raw, sin gear)
  private readonly limits: Record<string, ExerciseLimits> = {
    // Presses
    'press-banca': { min: 20, max: 335, step: 0.5, worldRecord: 335, category: 'compound' },
    'press-militar': { min: 10, max: 220, step: 0.5, worldRecord: 220, category: 'compound' },
    
    // Dominantes
    'peso-muerto': { min: 20, max: 501, step: 0.5, worldRecord: 501, category: 'compound' },
    'sentadilla': { min: 20, max: 490, step: 0.5, worldRecord: 490, category: 'compound' },
    
    // Jalones
    'dominadas': { min: 0, max: 100, step: 1, category: 'bodyweight' }, // Peso añadido
    'remo-barra': { min: 10, max: 300, step: 0.5, category: 'compound' },
    
    // Pierna
    'prensa-piernas': { min: 20, max: 1000, step: 2.5, category: 'compound' }, // Máquina permite más
    'extension-cuadriceps': { min: 5, max: 150, step: 0.5, category: 'isolation' },
    'curl-femoral': { min: 5, max: 120, step: 0.5, category: 'isolation' },
    
    // Brazo
    'curl-biceps': { min: 2, max: 100, step: 0.5, category: 'isolation' },
    'fondos': { min: 0, max: 100, step: 1, category: 'bodyweight' }, // Peso añadido
    
    // Default para ejercicios no catalogados
    'default': { min: 0, max: 200, step: 0.5, category: 'isolation' }
  };

  validate(exerciseSlug: string, weight: number, reps: number): ValidationResult {
    const limit = this.limits[exerciseSlug] || this.limits['default'];
    
    // Validación básica
    if (weight < 0) {
      return { valid: false, warning: 'El peso no puede ser negativo', severity: 'error' };
    }
    
    if (reps < 0) {
      return { valid: false, warning: 'Las repeticiones no pueden ser negativas', severity: 'error' };
    }

    if (reps > 100) {
      return { valid: true, warning: '¿100+ reps? Verifica que no sea un ejercicio de resistencia', severity: 'warning' };
    }

    // Validación de peso excesivo (anti-trol)
    if (limit.worldRecord && weight > limit.worldRecord) {
      return { 
        valid: false, 
        warning: `${weight}kg supera el récord mundial (${limit.worldRecord}kg). Revisa el peso ingresado.`, 
        severity: 'error' 
      };
    }

    // Warning si está cerca del límite (probable error de tipeo)
    if (limit.worldRecord && weight > limit.worldRecord * 0.8) {
      return { 
        valid: true, 
        warning: `${weight}kg está cerca del récord mundial. ¿Es correcto?`, 
        severity: 'warning' 
      };
    }

    // Warning si el peso es muy bajo para el ejercicio (posible error)
    if (weight > 0 && weight < limit.min && limit.category === 'compound') {
      return {
        valid: true,
        warning: `Peso muy bajo para ${exerciseSlug}. ¿Querías ${limit.min}kg?`,
        severity: 'info'
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Sugerir peso inicial basado en objetivo y historial
   */
  suggestStartingWeight(
    exerciseSlug: string, 
    targetWeight: number, 
    lastSessionWeight?: number
  ): number {
    if (lastSessionWeight) {
      // Si la última vez hizo X, sugerir X o X+2.5
      return lastSessionWeight >= targetWeight 
        ? lastSessionWeight + 2.5 
        : lastSessionWeight;
    }
    return targetWeight;
  }
}
