/**
 * content/registry.ts
 *
 * Hybrid registry: cloud (Supabase) → IndexedDB → local static fallback.
 * Never throws — if everything fails, returns the bundled local steps.
 *
 * USAGE:
 *   import { registry } from '@/content/registry';
 *   const steps = await registry.getStepsForLevel('pregamer');
 *   const step  = registry.getStepById('step-1-relaxation');  // sync, from cache
 */

import type { Step } from '@/core/engine/types';
import { relaxationStep } from './levels/pregamer/steps/relaxation';
import { autonomyStep } from './levels/pregamer/steps/autonomy';
import { assertivenessStep } from './levels/pregamer/steps/assertiveness';
import { executiveStep } from './levels/gamer/steps/executive';
import { flexibilityStep } from './levels/gamer/steps/flexibility';
import { inhibitionStep } from './levels/gamer/steps/inhibition';

export const ALL_STEPS: Record<string, Step> = {
  'step-relaxation-1': relaxationStep,
  'step-autonomy-1': autonomyStep,
  'step-3-assertiveness': assertivenessStep,
  'step-gamer-executive': executiveStep,
  'step-gamer-flexibility': flexibilityStep,
  'step-gamer-inhibition': inhibitionStep,
};

async function loadLocalSteps(): Promise<Record<string, Step>> {
  return ALL_STEPS;
}

// ── Memory cache (hydrated on first load) ──────────────────────────────
const memCache = new Map<string, Step>();

// ── IndexedDB helpers (graceful – no crash if unavailable) ────────────
async function idbGet(key: string): Promise<Step | null> {
  try {
    const { get, createStore } = await import('idb-keyval');
    const store = createStore('way-content', 'store');
    const value = await get(`step-${key}`, store);
    return value ?? null;
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: Step): Promise<void> {
  try {
    const { set, createStore } = await import('idb-keyval');
    const store = createStore('way-content', 'store');
    await set(`step-${key}`, value, store);
  } catch { /* ignore */ }
}

async function idbGetAllSteps(): Promise<Step[]> {
  try {
    const { keys, get, createStore } = await import('idb-keyval');
    const store = createStore('way-content', 'store');
    const allKeys = await keys(store);
    const stepKeys = (allKeys as string[]).filter(k => k.startsWith('step-'));
    const results = await Promise.all(stepKeys.map(k => get(k, store)));
    return results.filter(Boolean) as Step[];
  } catch {
    return [];
  }
}

// ── Cloud fetch (only if Supabase is configured) ───────────────────────
async function fetchFromCloud(levelId: string): Promise<Step[]> {
  try {
    // Lazy import so the whole module doesn't fail if supabase isn't set up
    const { contentService } = await import(
      '@/features/content/services/contentService'
    );
    return await contentService.getStepsByLevel(levelId);
  } catch (e) {
    console.warn('[Registry] Cloud fetch failed, will use local:', e);
    return [];
  }
}

// ── Public API ─────────────────────────────────────────────────────────
export const registry = {
  /**
   * Primary method for pages to get steps.
   * Resolution order: memory → cloud → IndexedDB → local static.
   */
  async getStepsForLevel(levelId: string): Promise<Step[]> {
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes revalidation window
    
    // Helper to process and cache steps
    const processAndCache = (steps: Step[]) => {
      const wayBlocklist = ['pregamer-way-01-02'];
      const filtered = steps.filter(s => s && !wayBlocklist.includes(s.id));
      const sorted = filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      
      sorted.forEach((step, sIdx) => {
        step.stepNumber = sIdx + 1;
        if (step.ways) {
          step.ways = step.ways.filter(w => !wayBlocklist.includes(w.id));
          step.ways.forEach((way, wIdx) => {
            way.stepNumber = step.stepNumber;
            way.wayNumber = wIdx + 1;
            way.theme = step.theme;
            // Ensure levelId is attached to ways for easier lookups
            (way as any).levelId = levelId;
          });
        }
        memCache.set(step.id, { ...step });
        idbSet(step.id, step).catch(err => {
          if (err.name === 'QuotaExceededError') {
            console.warn('[Registry] Storage quota exceeded, using memory only');
          }
        });
      });
      return sorted;
    };

    // Background sync function
    const triggerBackgroundSync = async (force = false) => {
      if (!navigator.onLine) return;
      
      // Check if we already synced recently
      const lastSync = sessionStorage.getItem(`last-sync-${levelId}`);
      const isStale = !lastSync || (Date.now() - parseInt(lastSync)) > CACHE_TTL;
      
      if (!force && !isStale) return;

      try {
        const startSync = performance.now();
        console.log(`[Registry] 🔄 Sincronizando nivel ${levelId} en segundo plano...`);
        const cloudSteps = await fetchFromCloud(levelId);
        if (cloudSteps && cloudSteps.length > 0) {
          processAndCache(cloudSteps);
          sessionStorage.setItem(`last-sync-${levelId}`, Date.now().toString());
          const syncDuration = (performance.now() - startSync).toFixed(2);
          console.log(`[Registry] ✨ Sincronización en la nube para ${levelId} completada en ${syncDuration}ms`);
        }
      } catch (e) {
        console.warn('[Registry] Background sync failed:', e);
      }
    };

    // 1. Try Memory Cache (Fastest)
    const cachedMem = Array.from(memCache.values()).filter(s => 
      s.levelId === levelId || (s as any).level_id === levelId
    );
    if (cachedMem.length > 0) {
      triggerBackgroundSync(); 
      return cachedMem.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // 2. Try IndexedDB (Very Fast)
    const idbSteps = await idbGetAllSteps();
    const cachedIdb = idbSteps.filter(s => 
      (s.levelId === levelId || (s as any).level_id === levelId) && 
      s.ways && s.ways.length > 0
    );
    if (cachedIdb.length > 0) {
      cachedIdb.forEach(s => memCache.set(s.id, s));
      triggerBackgroundSync();
      return cachedIdb.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // 3. Cloud (Only if no cache at all - First run)
    if (navigator.onLine) {
      try {
        const cloudSteps = await fetchFromCloud(levelId);
        if (cloudSteps && cloudSteps.length > 0) {
          return processAndCache(cloudSteps);
        }
      } catch (e) {
        console.error('[Registry] Initial cloud fetch failed:', e);
      }
    }

    // 4. Local Static Fallback (Always works)
    const local = await loadLocalSteps();
    const localForLevel = Object.values(local).filter(s => s.levelId === levelId);
    return processAndCache(localForLevel);
  },

  /**
   * Synchronous step lookup from memory cache.
   * Returns null if not yet loaded — call getStepsForLevel first.
   */
  getStepById(id: string): Step | null {
    return memCache.get(id) ?? null;
  },

  /**
   * Async step lookup: tries memory, then IndexedDB, then local.
   */
  async getStepByIdAsync(id: string): Promise<Step | null> {
    if (memCache.has(id)) return memCache.get(id)!;

    const idb = await idbGet(id);
    if (idb) { memCache.set(id, idb); return idb; }

    const local = await loadLocalSteps();
    if (local[id]) { memCache.set(id, local[id]); return local[id]; }

    return null;
  },

  /**
   * Publish a new/edited Way (syncs to cloud if available, always saves locally).
   */
  async publishWay(way: import('@/core/engine/types').Way, stepId: string): Promise<void> {
    // Update memory
    const step = memCache.get(stepId);
    if (step) {
      const idx = step.ways.findIndex(w => w.id === way.id);
      if (idx >= 0) step.ways[idx] = way;
      else step.ways.push(way);
      await idbSet(stepId, step);
    }

    // Queue for cloud sync
    try {
      const { offlineStorage } = await import('@/core/services/offlineStorage');
      await offlineStorage.addToSyncQueue({ type: 'PUBLISH_WAY', payload: { way, stepId } });
    } catch { /* ignore if offlineStorage not yet set up */ }

    // Immediate cloud attempt
    if (navigator.onLine) {
      this.processSyncQueue().catch(() => {});
    }
  },

  /** Force-refresh from cloud (call after regaining connectivity). */
  async syncFromCloud(levelId: string): Promise<void> {
    const steps = await fetchFromCloud(levelId);
    steps.forEach(s => {
      memCache.set(s.id, s);
      idbSet(s.id, s).catch(() => {});
    });
  },

  /** Process pending operations in the sync queue. */
  async processSyncQueue(): Promise<void> {
    try {
      const { offlineStorage } = await import('@/core/services/offlineStorage');
      const { contentService } = await import('@/features/content/services/contentService');
      
      const queue = await offlineStorage.getSyncQueue();
      if (queue.length === 0) return;

      console.log(`[Sync] Processing ${queue.length} pending operations...`);
      const failed: any[] = [];
      
      for (const op of queue) {
        try {
          if (op.type === 'PUBLISH_WAY') {
            await contentService.publishWay(op.payload.way, op.payload.stepId);
          }
        } catch (e) {
          failed.push(op);
        }
      }

      await offlineStorage.clearSyncQueue();
      if (failed.length > 0) {
        for (const op of failed) {
          await offlineStorage.addToSyncQueue(op);
        }
        console.warn(`[Sync] ${failed.length} operations failed, will retry later`);
      } else {
        console.log('[Sync] Completed successfully');
      }
    } catch (e) {
      console.error('[Sync] Critical error during sync processing:', e);
    }
  },

  /** Get every way from every currently loaded step. */
  getAllWays(): import('@/core/engine/types').Way[] {
    const allWays: import('@/core/engine/types').Way[] = [];
    memCache.forEach(step => {
      if (step.ways) allWays.push(...step.ways);
    });
    return allWays;
  },

  get cacheSize() { return memCache.size; },
};
