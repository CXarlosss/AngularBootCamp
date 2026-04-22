import { offlineStorage } from '@/core/services/offlineStorage';
import { imageCache } from '@/core/services/imageCache';
import { contentService } from '@/features/content/services/contentService';
import { relaxationStep } from './pregamer/steps/relaxation';
import { autonomyStep } from './pregamer/steps/autonomy';
import { assertivenessStep } from './pregamer/steps/assertiveness';
import { executiveStep } from './gamer/steps/executive';
import type { Step, Way } from '@/core/engine/types';

const LOCAL_FALLBACK: Record<string, Step> = {
  'step-1-relaxation': relaxationStep,
  'step-2-autonomy': autonomyStep,
  'step-3-assertiveness': assertivenessStep,
  'step-1-executive': executiveStep,
};

class ContentRegistry {
  private memoryCache: Map<string, Step> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    // 1. Cargar todo lo que tengamos en IndexedDB a memoria
    const localSteps = await offlineStorage.getAllSteps();
    localSteps.forEach((s: Step) => this.memoryCache.set(s.id, s));
    
    // Precargar fallback local si no hay nada en DB
    if (localSteps.length === 0) {
      Object.entries(LOCAL_FALLBACK).forEach(([id, step]) => {
        this.memoryCache.set(id, step);
        offlineStorage.saveStep(step);
      });
    }
    
    this.initialized = true;
    console.log(`[Registry] ${this.memoryCache.size} steps inicializados (DB + Fallback)`);
  }

  async getStepsForLevel(levelId: string): Promise<Step[]> {
    await this.init();

    if (navigator.onLine) {
      try {
        const cloudSteps = await contentService.getStepsByLevel(levelId);
        
        if (cloudSteps.length > 0) {
          for (const step of cloudSteps) {
            this.memoryCache.set(step.id, step);
            await offlineStorage.saveStep(step);
            
            // Precachear imágenes en background
            const imageUrls = this.extractImages(step);
            imageCache.prefetchImages(imageUrls).catch(console.error);
          }
          return cloudSteps;
        }
      } catch (e) {
        console.warn('[Registry] Fallo cloud, usando IndexedDB:', e);
      }
    }

    // Fallback offline
    return Array.from(this.memoryCache.values())
      .filter(s => s.levelId === levelId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getStepById(id: string): Promise<Step | null> {
    await this.init();
    
    if (this.memoryCache.has(id)) return this.memoryCache.get(id)!;
    
    const local = await offlineStorage.getStep(id);
    if (local) {
      this.memoryCache.set(id, local);
      return local;
    }
    
    return null;
  }

  async publishWay(way: Way, stepId: string): Promise<void> {
    // Guardar local inmediatamente en IndexedDB
    const step = await this.getStepById(stepId);
    if (step) {
      const existingIdx = step.ways.findIndex(w => w.id === way.id);
      if (existingIdx >= 0) step.ways[existingIdx] = way;
      else step.ways.push(way);
      
      await offlineStorage.saveStep(step);
      this.memoryCache.set(stepId, step);
    }

    // Encolar para sync en IndexedDB
    await offlineStorage.addToSyncQueue({
      type: 'PUBLISH_WAY',
      payload: { way, stepId }
    });

    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    const queue = await offlineStorage.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`[Sync] Procesando ${queue.length} operaciones pendientes...`);
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
      console.warn(`[Sync] ${failed.length} operaciones fallaron, reintentar luego`);
    } else {
      console.log('[Sync] Completado con éxito');
    }
  }

  private extractImages(step: Step): string[] {
    const urls: string[] = [];
    if (step.ways) {
      step.ways.forEach(w => {
        if (w.stimulus.image) urls.push(w.stimulus.image);
        if (w.options) {
          w.options.forEach((o: any) => {
            if (o.image) urls.push(o.image);
          });
        }
      });
    }
    return [...new Set(urls)];
  }
}

export const registry = new ContentRegistry();
export const ALL_STEPS = LOCAL_FALLBACK;
