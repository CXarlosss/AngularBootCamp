import { get, set, del, keys, createStore } from 'idb-keyval';

// Store separado para contenido vs progreso
const contentStore = createStore('way-content', 'store');
const progressStore = createStore('way-progress', 'store');
const imageStore = createStore('way-images', 'store');

export const offlineStorage = {
  // ========== CONTENIDO (Steps, Ways) ==========
  async saveStep(step: any): Promise<void> {
    await set(`step-${step.id}`, step, contentStore);
  },

  async getStep(stepId: string): Promise<any | undefined> {
    return get(`step-${stepId}`, contentStore);
  },

  async getAllSteps(): Promise<any[]> {
    const allKeys = await keys(contentStore);
    const stepKeys = allKeys.filter(k => String(k).startsWith('step-'));
    return Promise.all(stepKeys.map(k => get(k, contentStore)));
  },

  async deleteStep(stepId: string): Promise<void> {
    await del(`step-${stepId}`, contentStore);
  },

  // ========== IMÁGENES (Blobs) ==========
  async saveImage(url: string, blob: Blob): Promise<void> {
    await set(`img-${url}`, blob, imageStore);
  },

  async getImage(url: string): Promise<Blob | undefined> {
    return get(`img-${url}`, imageStore);
  },

  async hasImage(url: string): Promise<boolean> {
    const blob = await get(`img-${url}`, imageStore);
    return !!blob;
  },

  // ========== PROGRESO DEL NIÑO ==========
  async saveProgress(patientId: string, data: any): Promise<void> {
    await set(`progress-${patientId}`, data, progressStore);
  },

  async getProgress(patientId: string): Promise<any | undefined> {
    return get(`progress-${patientId}`, progressStore);
  },

  // ========== COLA DE SINCRONIZACIÓN ==========
  async addToSyncQueue(operation: any): Promise<void> {
    const queue: any[] = (await get('sync-queue', progressStore)) || [];
    queue.push({ ...operation, timestamp: Date.now() });
    await set('sync-queue', queue, progressStore);
  },

  async getSyncQueue(): Promise<any[]> {
    return (await get('sync-queue', progressStore)) || [];
  },

  async clearSyncQueue(): Promise<void> {
    await del('sync-queue', progressStore);
  },

  // ========== UTILIDADES ==========
  async clearAll(): Promise<void> {
    const allKeys = await keys(contentStore);
    await Promise.all(allKeys.map(k => del(k, contentStore)));
  },

  async getStorageSize(): Promise<string> {
    const allImages = await keys(imageStore);
    let totalBytes = 0;
    for (const key of allImages) {
      const blob: Blob | undefined = await get(key, imageStore);
      if (blob) totalBytes += blob.size;
    }
    return (totalBytes / 1024 / 1024).toFixed(2) + ' MB';
  }
};
