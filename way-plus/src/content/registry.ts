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

export const ALL_STEPS: Record<string, Step> = {
  'step-1-relaxation': relaxationStep,
  'step-2-autonomy': autonomyStep,
  'step-3-assertiveness': assertivenessStep,
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
    // 1. Memory hit
    const cached = Array.from(memCache.values()).filter(s => s.levelId === levelId);
    if (cached.length > 0) return cached.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // 2. Try cloud (non-blocking: if it fails we fall through)
    if (navigator.onLine) {
      const cloudSteps = await fetchFromCloud(levelId);
      if (cloudSteps.length > 0) {
        cloudSteps.forEach(s => {
          memCache.set(s.id, s);
          idbSet(s.id, s).catch(() => {});
        });
        return cloudSteps;
      }
    }

    // 3. IndexedDB
    const idbSteps = await idbGetAllSteps();
    const idbForLevel = idbSteps.filter(s => s.levelId === levelId);
    if (idbForLevel.length > 0) {
      idbForLevel.forEach(s => memCache.set(s.id, s));
      return idbForLevel.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // 4. Local static (always works)
    const local = await loadLocalSteps();
    const localForLevel = Object.values(local).filter(s => s.levelId === levelId);
    localForLevel.forEach(s => memCache.set(s.id, s));
    return localForLevel.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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

  /** Expose current memory cache size for debugging. */
  get cacheSize() { return memCache.size; },
};
