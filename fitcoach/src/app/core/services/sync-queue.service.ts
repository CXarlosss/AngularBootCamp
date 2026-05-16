import { Injectable, inject, signal, computed } from '@angular/core';
import { OfflineStorageService } from './offline-storage.service';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SyncQueueItem {
  id?: number;
  type: 'workout_session';
  payload: {
    workout: any;
    sets: any[];
  };
  timestamp: number;
  attempts: number;
}

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private storage = inject(OfflineStorageService);
  private supabase = inject(SupabaseClient);
  
  public isSyncing = signal(false);
  public isOnline = signal(navigator.onLine);
  public pendingCount = signal(0);
  
  private currentSyncId: string | null = null;
  private handlers = new Map<string, (payload: any) => Promise<boolean>>();

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.processQueue();
    });
    window.addEventListener('offline', () => this.isOnline.set(false));
    
    this.registerDefaultHandlers();
    this.updatePendingCount();
  }

  private registerDefaultHandlers() {
    this.handlers.set('workout_session', async (payload) => {
      // 1. Crear workout_log
      const { data: workout, error: workoutError } = await this.supabase
        .from('workout_logs')
        .insert(payload.workout)
        .select()
        .single();
      
      if (workoutError) {
        console.error('Error creating workout_log:', workoutError);
        return false;
      }
      
      // 2. Crear sets con workout_log_id real
      const setsWithWorkoutId = payload.sets.map((s: any) => ({
        ...s,
        workout_log_id: workout.id
      }));
      
      const { error: setsError } = await this.supabase
        .from('set_logs')
        .insert(setsWithWorkoutId);
      
      if (setsError) {
        console.error('Error creating set_logs, rolling back workout_log:', setsError);
        // Rollback: eliminar workout_log huérfano
        await this.supabase.from('workout_logs').delete().eq('id', workout.id);
        return false;
      }
      
      return true;
    });
  }

  async enqueue(type: 'workout_session', payload: any) {
    await this.storage.addItem('sync_queue', {
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0
    });
    this.updatePendingCount();
    if (this.isOnline()) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    // Lock doble: Signal + timestamp para evitar race condition de micro-tareas
    if (this.isSyncing() || !this.isOnline()) return;
    
    const syncId = `sync_${Date.now()}_${Math.random()}`;
    this.currentSyncId = syncId;
    this.isSyncing.set(true);
    
    try {
      const items = await this.storage.getAll('sync_queue');
      if (items.length === 0) return;
      
      // Ordenar por timestamp (FIFO)
      items.sort((a, b) => a.timestamp - b.timestamp);
      
      for (const item of items) {
        // Verificar que no otro sync nos ha desplazado
        if (this.currentSyncId !== syncId) {
          console.warn('Sync preempted by newer instance');
          return;
        }
        
        // Verificar conexión ANTES de cada item
        if (!navigator.onLine) {
          console.log('Connection lost during sync, pausing');
          return; // Se reintentará al volver online
        }
        
        const handler = this.handlers.get(item.type);
        if (!handler) continue;
        
        try {
          const success = await handler(item.payload);
          if (success) {
            await this.storage.deleteItem('sync_queue', item.id);
          } else {
            // Handler devolvió false (validación server-side falló)
            item.attempts++;
            if (item.attempts > 3) {
              await this.moveToDeadLetter(item);
              await this.storage.deleteItem('sync_queue', item.id);
            }
          }
        } catch (e) {
          // Error de red/Supabase
          item.attempts++;
          if (item.attempts > 3) {
            await this.moveToDeadLetter(item);
            await this.storage.deleteItem('sync_queue', item.id);
          }
        }
        this.updatePendingCount();
      }
    } finally {
      if (this.currentSyncId === syncId) {
        this.isSyncing.set(false);
        this.currentSyncId = null;
      }
    }
  }

  private async moveToDeadLetter(item: any): Promise<void> {
    await this.storage.addItem('sync_dead_letter', {
      ...item,
      failedAt: Date.now(),
      reason: 'max_attempts_exceeded'
    });
  }

  private async updatePendingCount() {
    const items = await this.storage.getAll('sync_queue');
    this.pendingCount.set(items.length);
  }

  get status() {
    return computed(() => {
      if (!this.isOnline()) return 'offline';
      if (this.isSyncing()) return 'syncing';
      return 'online';
    });
  }
}
