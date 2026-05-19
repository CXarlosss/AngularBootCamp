import { Injectable, signal, computed } from '@angular/core';
import { OfflineStorageService } from './offline-storage.service';
import { inject } from '@angular/core';
import { supabase } from '../supabase.client';

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
  private supabase = supabase;
  
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
      console.log('[SyncQueue] Processing workout_session handler:', payload);
      
      // 1. Crear workout_log (con upsert para evitar errores de duplicación si ya se procesó parcialmente)
      const { data: workout, error: workoutError } = await this.supabase
        .from('workout_logs')
        .upsert({
          id: payload.workout.id,
          client_id: payload.workout.client_id,
          assigned_routine_id: payload.workout.assigned_routine_id,
          day_id: payload.workout.day_id,
          logged_date: payload.workout.logged_date,
          completed: payload.workout.completed
        })
        .select()
        .single();
      
      if (workoutError) {
        console.error('[SyncQueue] Error upserting workout_log:', workoutError);
        return false;
      }
      
      // 2. Crear sets con el ID real del log
      const setsWithWorkoutId = payload.sets.map((s: any) => ({
        id: s.id,
        workout_log_id: workout.id,
        exercise_id: s.exercise_id,
        exercise_name: s.exercise_name,
        set_number: s.set_number,
        weight_kg: s.weight_kg,
        reps_done: s.reps_done,
        completed_at: s.completed_at,
        notes: s.notes
      }));
      
      // Upsert de series para evitar duplicidad si reintenta
      const { error: setsError } = await this.supabase
        .from('set_logs')
        .upsert(setsWithWorkoutId);
      
      if (setsError) {
        console.error('[SyncQueue] Error upserting set_logs:', setsError);
        return false;
      }

      // 3. Marcar el día como completado en completed_days
      const { error: compError } = await this.supabase
        .from('completed_days')
        .upsert(
          {
            client_id: payload.workout.client_id,
            routine_id: payload.workout.routine_id,
            day_id: payload.workout.day_id,
            completed_at: new Date().toISOString()
          },
          {
            onConflict: 'client_id,day_id',
            ignoreDuplicates: true
          }
        );

      if (compError) {
        console.error('[SyncQueue] Error marking day as completed:', compError);
      }

      // 4. Notificación para el coach si tiene coach asignado
      try {
        const { data: clientProfile } = await this.supabase
          .from('profiles')
          .select('full_name, coach_id')
          .eq('id', payload.workout.client_id)
          .single();

        if (clientProfile?.coach_id) {
          await this.supabase
            .from('notifications')
            .insert({
              user_id: clientProfile.coach_id,
              type: 'workout_completed',
              title: `💪 ${clientProfile.full_name ?? 'Tu cliente'} ha entrenado`,
              body: `Ha completado: ${payload.label}`,
              data: {
                client_id: payload.workout.client_id,
                routine_id: payload.workout.routine_id,
                day_id: payload.workout.day_id
              },
              created_at: new Date().toISOString()
            });
        }
      } catch (e) {
        console.error('[SyncQueue] Error sending notification to coach:', e);
      }

      // 5. Guardar XP en athlete_ranks con protección contra duplicados (Idempotencia)
      try {
        const { data: rank, error: rankError } = await this.supabase
          .from('athlete_ranks')
          .select('*')
          .eq('client_id', payload.workout.client_id)
          .maybeSingle();

        if (rankError) {
          console.error('[SyncQueue] Error fetching rank for XP:', rankError);
        } else if (rank) {
          // Idempotency check: si este workout ya sumó XP, lo ignoramos para evitar duplicidades
          if (rank.last_sync_workout_id === payload.workout.id) {
            console.log('[SyncQueue] XP already applied for this workout. Skipping athlete_ranks update.');
          } else {
            const daysXp = payload.xp.daysXp || 0;
            const setsXp = payload.xp.setsXp || 0;
            const progressXp = payload.xp.progressXp || 0;
            const xpToAdd = daysXp + setsXp + progressXp;
            const newTotal = (rank.xp_total || 0) + xpToAdd;

            const RANKS_FORMULA = [
              { xpBase: 0, level: 0 },
              { xpBase: 500, level: 1 },
              { xpBase: 2000, level: 2 },
              { xpBase: 5000, level: 3 },
              { xpBase: 12000, level: 4 },
              { xpBase: 30000, level: 5 }
            ];
            let ri = 0;
            for (let i = RANKS_FORMULA.length - 1; i >= 0; i--) {
              if (newTotal >= RANKS_FORMULA[i].xpBase) { ri = i; break; }
            }
            const newLevel = RANKS_FORMULA[ri].level;

            await this.supabase
              .from('athlete_ranks')
              .update({
                xp_total: newTotal,
                rank_level: newLevel,
                days_xp: (rank.days_xp || 0) + daysXp,
                sets_xp: (rank.sets_xp || 0) + setsXp,
                progress_xp: (rank.progress_xp || 0) + progressXp,
                last_sync_workout_id: payload.workout.id,
                updated_at: new Date().toISOString()
              })
              .eq('client_id', payload.workout.client_id);
          }
        } else {
          const daysXp = payload.xp.daysXp || 0;
          const setsXp = payload.xp.setsXp || 0;
          const progressXp = payload.xp.progressXp || 0;
          const xpToAdd = daysXp + setsXp + progressXp;

          const RANKS_FORMULA = [
            { xpBase: 0, level: 0 },
            { xpBase: 500, level: 1 },
            { xpBase: 2000, level: 2 },
            { xpBase: 5000, level: 3 },
            { xpBase: 12000, level: 4 },
            { xpBase: 30000, level: 5 }
          ];
          let ri = 0;
          for (let i = RANKS_FORMULA.length - 1; i >= 0; i--) {
            if (xpToAdd >= RANKS_FORMULA[i].xpBase) { ri = i; break; }
          }
          const newLevel = RANKS_FORMULA[ri].level;

          await this.supabase
            .from('athlete_ranks')
            .insert({
              client_id: payload.workout.client_id,
              xp_total: xpToAdd,
              rank_level: newLevel,
              days_xp: daysXp,
              sets_xp: setsXp,
              progress_xp: progressXp,
              last_sync_workout_id: payload.workout.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      } catch (e) {
        console.error('[SyncQueue] Error updating ranks/XP:', e);
      }

      console.log('[SyncQueue] workout_session synced successfully!');
      return true;
    });
  }

  async checkConnectionDynamic(): Promise<boolean> {
    if (!navigator.onLine) {
      this.isOnline.set(false);
      return false;
    }
    try {
      // Ping real y liviano con CORS habilitado consultando la base de datos de Supabase.
      // Si estamos offline físicamente, fetch fallará y lanzará una excepción.
      await this.supabase
        .from('athlete_ranks')
        .select('client_id')
        .limit(1);
      
      this.isOnline.set(true);
      return true;
    } catch (e) {
      console.warn('[SyncQueue] Dynamic network ping failed (physically offline):', e);
      this.isOnline.set(false);
      return false;
    }
  }

  async enqueue(type: 'workout_session', payload: any) {
    await this.storage.addItem('sync_queue', {
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0,
      nextAttemptAt: 0
    });
    this.updatePendingCount();
    
    const online = await this.checkConnectionDynamic();
    if (online) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    // Evitar ejecuciones duplicadas
    if (this.isSyncing()) return;
    
    // Check dinámico de red antes de procesar
    const online = await this.checkConnectionDynamic();
    if (!online) return;
    
    const syncId = `sync_${Date.now()}_${Math.random()}`;
    this.currentSyncId = syncId;
    this.isSyncing.set(true);
    
    try {
      const items = await this.storage.getAll('sync_queue');
      if (items.length === 0) {
        // Limpiar el estado de sincronización de manera explícita antes de salir
        this.isSyncing.set(false);
        this.currentSyncId = null;
        return;
      }
      
      // Ordenar por timestamp (FIFO)
      items.sort((a, b) => a.timestamp - b.timestamp);
      
      const now = Date.now();
      
      for (const item of items) {
        // Verificar preemption
        if (this.currentSyncId !== syncId) {
          console.warn('[SyncQueue] Sync preempted by newer instance');
          return;
        }
        
        // Verificar si el item está en cooldown de reintento (backoff)
        if (item.nextAttemptAt && item.nextAttemptAt > now) {
          console.log(`[SyncQueue] Skipping item ${item.id} (in cooldown for another ${Math.round((item.nextAttemptAt - now) / 1000)}s)`);
          continue;
        }
        
        // Verificar red dinámica antes de procesar la siguiente microtarea
        const stillOnline = await this.checkConnectionDynamic();
        if (!stillOnline) {
          console.log('[SyncQueue] Connection lost during sync loop, pausing queue processing');
          return;
        }
        
        const handler = this.handlers.get(item.type);
        if (!handler) continue;
        
        const handleFailure = async (reason: string) => {
          item.attempts = (item.attempts || 0) + 1;
          if (item.attempts >= 3) {
            console.error(`[SyncQueue] Item ${item.id} exceeded max attempts (3). Moving to Dead-Letter store.`);
            await this.moveToDeadLetter({ ...item, failureReason: reason });
            await this.storage.deleteItem('sync_queue', item.id);
          } else {
            // Cooldown exponencial: 5s * 2^intentos (ej: 10s, 20s)
            const backoffDelay = Math.pow(2, item.attempts) * 5000;
            item.nextAttemptAt = Date.now() + backoffDelay;
            console.warn(`[SyncQueue] Item ${item.id} failed. Attempt ${item.attempts}/3. Retrying in ${backoffDelay / 1000}s. Reason: ${reason}`);
            await this.storage.updateItem('sync_queue', item);
          }
          this.updatePendingCount();
        };
        
        try {
          const success = await handler(item.payload);
          if (success) {
            console.log(`[SyncQueue] Item ${item.id} synchronized successfully to Supabase.`);
            await this.storage.deleteItem('sync_queue', item.id);
            this.updatePendingCount();
          } else {
            await handleFailure('Handler returned false (database constraint or rollback)');
          }
        } catch (e: any) {
          await handleFailure(e?.message || 'Unexpected network/runtime error during handler execution');
        }
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
      reason: item.failureReason || 'max_attempts_exceeded'
    });
  }

  private async updatePendingCount() {
    const items = await this.storage.getAll('sync_queue');
    this.pendingCount.set(items.length);
  }

  public readonly status = computed(() => {
    if (!this.isOnline()) return 'offline';
    if (this.isSyncing()) return 'syncing';
    return 'online';
  });
}
