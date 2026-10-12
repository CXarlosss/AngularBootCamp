/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Adaptive Engine — Ajusta niveles en tiempo real
 * Modifica: tiempo límite, intentos, distracciones, tamaño targets
 * ═══════════════════════════════════════════════════════════════
 */

import type { FrustrationMetrics } from './frustrationDetector';

export interface LevelParameters {
  timeLimitSeconds: number;
  attemptsAllowed: number;
  targetSize: 'large' | 'medium' | 'small';
  distractionCount: number; // Elementos distractores en pantalla
  hintFrequency: 'always' | 'often' | 'rarely' | 'never';
  animationSpeed: 'slow' | 'normal' | 'fast';
}

export interface AdaptationResult {
  parameters: LevelParameters;
  action: 'none' | 'ease_time' | 'ease_targets' | 'add_hints' | 'reduce_distractions' | 'pause_suggest';
  message?: string;
  hapticPattern: 'none' | 'encourage' | 'calm';
}

const BASE_PARAMS: LevelParameters = {
  timeLimitSeconds: 30,
  attemptsAllowed: 3,
  targetSize: 'medium',
  distractionCount: 2,
  hintFrequency: 'rarely',
  animationSpeed: 'normal',
};

class AdaptiveEngine {
  private currentParams: LevelParameters = { ...BASE_PARAMS };
  private adaptationHistory: Array<{ timestamp: number; action: string }> = [];
  private readonly MAX_ADAPTATIONS_PER_MINUTE = 3;

  getCurrentParams(): LevelParameters {
    return { ...this.currentParams };
  }

  adapt(metrics: FrustrationMetrics): AdaptationResult {
    const now = Date.now();
    const recentAdaptations = this.adaptationHistory.filter((a) => now - a.timestamp < 60000);

    // Evitar sobre-adaptación
    if (recentAdaptations.length >= this.MAX_ADAPTATIONS_PER_MINUTE) {
      return {
        parameters: this.currentParams,
        action: 'none',
        hapticPattern: 'none',
      };
    }

    let action: AdaptationResult['action'] = 'none';
    let message: string | undefined;
    let hapticPattern: AdaptationResult['hapticPattern'] = 'none';

    switch (metrics.recommendation) {
      case 'ease': {
        // Elegir la adaptación más apropiada según triggers
        if (metrics.triggers.includes('erratic_tapping') || metrics.triggers.includes('no_recent_success')) {
          // Hacer targets más grandes y añadir hints
          if (this.currentParams.targetSize !== 'large') {
            this.currentParams.targetSize = this.currentParams.targetSize === 'small' ? 'medium' : 'large';
            action = 'ease_targets';
            message = '¡Los objetos crecen para ayudarte!';
            hapticPattern = 'encourage';
          } else if (this.currentParams.hintFrequency !== 'always') {
            this.currentParams.hintFrequency = 'always';
            action = 'add_hints';
            message = 'Mira la luz brillante...';
            hapticPattern = 'encourage';
          }
        } else if (metrics.triggers.includes('consecutive_errors_3') || metrics.triggers.includes('consecutive_errors_4plus')) {
          // Dar más tiempo
          if (this.currentParams.timeLimitSeconds < 60) {
            this.currentParams.timeLimitSeconds += 10;
            action = 'ease_time';
            message = 'Tómate tu tiempo, no hay prisa';
            hapticPattern = 'calm';
          }
        } else if (metrics.triggers.includes('repeated_help_requests')) {
          // Reducir distracciones
          if (this.currentParams.distractionCount > 0) {
            this.currentParams.distractionCount = Math.max(0, this.currentParams.distractionCount - 1);
            action = 'reduce_distractions';
            message = 'Pantalla limpia, solo tú y la misión';
            hapticPattern = 'calm';
          }
        }
        break;
      }

      case 'pause': {
        action = 'pause_suggest';
        message = '¿Quieres hacer una pausa de respiración?';
        hapticPattern = 'calm';
        break;
      }

      case 'encourage': {
        // Solo haptic y mensaje, sin cambiar parámetros aún
        hapticPattern = 'encourage';
        message = '¡Casi lo tienes! Inténtalo una vez más';
        break;
      }

      case 'maintain':
      default:
        break;
    }

    if (action !== 'none') {
      this.adaptationHistory.push({ timestamp: now, action });
    }

    return {
      parameters: { ...this.currentParams },
      action,
      message,
      hapticPattern,
    };
  }

  // Resetear al cambiar de nivel
  reset(baseParams?: Partial<LevelParameters>) {
    this.currentParams = { ...BASE_PARAMS, ...baseParams };
    this.adaptationHistory = [];
  }
}

export const adaptiveEngine = new AdaptiveEngine();
