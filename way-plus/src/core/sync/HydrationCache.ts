/**
 * HydrationCache.ts
 * 
 * Parche anti-flash de UX. Guarda una copia volátil del estado en sessionStorage
 * para hidratar la UI instantáneamente al recargar, mientras el SyncEngine 
 * hace el pull real de Supabase.
 */

const CACHE_KEY = 'way-hydration-cache';

export interface CacheableState {
  coins: number;
  completedWays: string[];
  avatar: string;
  name: string;
  currentLevel: string;
}

export const HydrationCache = {
  save: (patientId: string, state: CacheableState) => {
    try {
      const data = {
        ...state,
        ts: Date.now(),
        patientId
      };
      sessionStorage.setItem(`${CACHE_KEY}-${patientId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('[HydrationCache] Error saving to sessionStorage', e);
    }
  },
  
  load: (patientId: string): CacheableState | null => {
    try {
      const raw = sessionStorage.getItem(`${CACHE_KEY}-${patientId}`);
      if (!raw) return null;
      
      const parsed = JSON.parse(raw);
      
      // Si el cache es de hace más de 30 min, lo ignoramos por seguridad
      if (Date.now() - parsed.ts > 1000 * 60 * 30) {
        sessionStorage.removeItem(`${CACHE_KEY}-${patientId}`);
        return null;
      }
      
      return parsed;
    } catch (e) {
      return null;
    }
  },
  
  clear: (patientId: string) => {
    sessionStorage.removeItem(`${CACHE_KEY}-${patientId}`);
  }
};
