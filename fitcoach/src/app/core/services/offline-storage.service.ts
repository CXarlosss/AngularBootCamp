import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private readonly DB_NAME = 'fitcoach_offline_db';
  private readonly DB_VERSION = 2;
  private readonly MAX_QUEUE_ITEMS = 100;
  private readonly MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

  private async getDB(): Promise<IDBPDatabase> {
    return openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('sync_dead_letter')) {
          db.createObjectStore('sync_dead_letter', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('workout_cache')) {
          db.createObjectStore('workout_cache', { keyPath: 'slug' });
        }
      },
    });
  }

  async addItem(storeName: string, item: any): Promise<number> {
    if (storeName === 'sync_queue') {
      const current = await this.getAll('sync_queue');
      if (current.length >= this.MAX_QUEUE_ITEMS) {
        // Eliminar el más antiguo (FIFO)
        const oldest = current.sort((a, b) => a.timestamp - b.timestamp)[0];
        await this.deleteItem('sync_queue', oldest.id);
      }
    }
    
    const db = await this.getDB();
    return db.add(storeName, { ...item, timestamp: item.timestamp || Date.now(), attempts: item.attempts || 0 });
  }

  async getAll(storeName: string): Promise<any[]> {
    const db = await this.getDB();
    return db.getAll(storeName);
  }

  async deleteItem(storeName: string, id: any): Promise<void> {
    const db = await this.getDB();
    await db.delete(storeName, id);
  }

  async cleanupCache(): Promise<void> {
    const items = await this.getAll('workout_cache');
    const now = Date.now();
    for (const item of items) {
      if (now - (item.cachedAt || 0) > this.MAX_CACHE_AGE_MS) {
        await this.deleteItem('workout_cache', item.slug);
      }
    }
  }
}
