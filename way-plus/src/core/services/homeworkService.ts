import { patientService } from './patientService';

/**
 * homeworkService.ts
 * Cache Layer para las tareas (homework) del paciente.
 * Evita peticiones repetitivas a Supabase durante la navegación del niño.
 */

let cachedHomeworkIds: Set<string> | null = null;
let lastPatientId: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const homeworkService = {
  /**
   * Obtiene los IDs de las tareas del paciente, usando caché si es posible.
   */
  async getHomeworkIds(patientId: string): Promise<Set<string>> {
    const now = Date.now();
    
    // Si el paciente cambia, invalidamos caché inmediatamente
    if (patientId !== lastPatientId) {
      this.clearCache();
    }

    if (cachedHomeworkIds && (now - cacheTimestamp < CACHE_TTL)) {
      return cachedHomeworkIds;
    }

    try {
      const ids = await patientService.getHomework(patientId);
      cachedHomeworkIds = new Set(ids);
      lastPatientId = patientId;
      cacheTimestamp = now;
      return cachedHomeworkIds;
    } catch (error) {
      console.error('[HomeworkService] Error fetching homework:', error);
      return new Set();
    }
  },

  /**
   * Verifica si un Way específico es tarea del paciente.
   */
  async isHomework(patientId: string, wayId: string): Promise<boolean> {
    const ids = await this.getHomeworkIds(patientId);
    return ids.has(wayId);
  },

  clearCache() {
    cachedHomeworkIds = null;
    lastPatientId = null;
    cacheTimestamp = 0;
  }
};
