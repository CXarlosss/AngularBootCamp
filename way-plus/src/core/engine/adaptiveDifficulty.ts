export interface AttemptRecord {
  wayId: string;
  timestamp: number;
  attemptsNeeded: number;
  timeSpentSeconds: number;
  helpUsed: boolean;
}

export interface DifficultyAdjustment {
  type: 'easier' | 'maintain' | 'harder';
  reason: string;
  modifications: {
    showHint?: boolean;
    reduceOptions?: boolean;
    extendTime?: boolean;
    skipOnFail?: boolean;
  };
}

export class AdaptiveDifficultyEngine {
  private history: AttemptRecord[] = [];
  
  addAttempt(record: AttemptRecord) {
    this.history.push(record);
    // Mantener solo últimos 20 intentos para análisis de racha reciente
    if (this.history.length > 20) this.history.shift();
  }
  
  analyze(wayId: string): DifficultyAdjustment {
    const recent = this.history.filter(h => h.wayId === wayId);
    const avgAttempts = recent.reduce((s, h) => s + h.attemptsNeeded, 0) / (recent.length || 1);
    const avgTime = recent.reduce((s, h) => s + h.timeSpentSeconds, 0) / (recent.length || 1);
    
    // Reglas de negocio basadas en psicología del aprendizaje (TEA/NEE)
    if (avgAttempts >= 3 || avgTime > 60) {
      return {
        type: 'easier',
        reason: 'Frustración detectada: múltiples errores o tiempo excesivo',
        modifications: {
          showHint: true,
          reduceOptions: true,
          extendTime: true,
        }
      };
    }
    
    if (recent.length >= 2 && avgAttempts === 1 && avgTime < 10) {
      return {
        type: 'harder',
        reason: 'Dominio demostrado: respuesta inmediata y correcta',
        modifications: {
          showHint: false,
        }
      };
    }
    
    return {
      type: 'maintain',
      reason: 'Ritmo de aprendizaje adecuado',
      modifications: {}
    };
  }
  
  getTherapistRecommendation(): string {
    if (this.history.length === 0) return "Iniciando evaluación conductual...";
    
    const globalAvg = this.history.reduce((s, h) => s + h.attemptsNeeded, 0) / this.history.length;
    
    if (globalAvg > 2.5) return "El niño muestra dificultades generalizadas. Considerar reducir dificultad global o revisar comprensión de pictogramas.";
    if (globalAvg < 1.2) return "Dominio casi perfecto. Aumentar dificultad o avanzar al siguiente nivel.";
    return "Progresión adecuada. Mantener secuencia actual.";
  }
}

// Singleton para persistencia en sesión
export const adaptiveEngine = new AdaptiveDifficultyEngine();
