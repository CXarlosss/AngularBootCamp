export interface CacheableState {
  coins: number;
  completedWays: string[];
  avatar: string;
  name: string;
  currentLevel: string;
}

const CACHE_KEY_PREFIX = 'way-hydration-cache-';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

export const HydrationCache = {
  save(patientId: string, state: CacheableState) {
    const data = {
      state,
      ts: Date.now()
    };
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${patientId}`, JSON.stringify(data));
  },

  load(patientId: string): CacheableState | null {
    const { state } = this.loadWithTimestamp(patientId);
    return state;
  },

  /**
   * Carga el estado y su timestamp original. 
   * Útil para lógica de "Last Write Wins" durante el initialPull.
   */
  loadWithTimestamp(patientId: string): { state: CacheableState | null, ts: number } {
    try {
      const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${patientId}`);
      if (!raw) return { state: null, ts: 0 };

      const { state, ts } = JSON.parse(raw);
      
      // Verificar TTL
      if (Date.now() - ts > CACHE_TTL_MS) {
        sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${patientId}`);
        return { state: null, ts: 0 };
      }

      return { state, ts };
    } catch (e) {
      return { state: null, ts: 0 };
    }
  }
};
