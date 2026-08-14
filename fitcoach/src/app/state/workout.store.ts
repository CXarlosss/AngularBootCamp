import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { WorkoutLog, SetLog } from '../core/models/workout-log.model';
import { WorkoutService } from '../core/services/workout.service';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../core/auth/auth.service';
import { WorkoutEventsService } from '../core/services/workout-events.service';
import { RankService } from '../core/services/rank.service';
import { WorkoutBlockedError } from '../core/models/errors.model';
import { SyncQueueService } from '../core/services/sync-queue.service';

interface WorkoutState {
  activeLog: WorkoutLog | null;   // el entrenamiento en curso
  history: WorkoutLog[];
  loading: boolean;
}

export const WorkoutStore = signalStore(
  { providedIn: 'root' },
  withState<WorkoutState>({ activeLog: null, history: [], loading: false }),

  withComputed(({ activeLog }) => ({
    totalSetsLogged: computed(() =>
      activeLog()?.sets.length ?? 0
    ),
    completionPercent: computed(() => {
      const log = activeLog();
      if (!log) return 0;
      // Se calcula contra el total de series esperadas de la rutina
      return 0; // se completa en la fase 2 con el join de rutina
    }),
  })),

  withMethods((
    store,
    svc = inject(WorkoutService),
    auth = inject(AuthService),
    events = inject(WorkoutEventsService),
    rankSvc = inject(RankService),
    syncQueue = inject(SyncQueueService)
  ) => ({

    async startWorkout(assignedRoutineId: string, routineId: string, clientId: string, dayId: string): Promise<void> {
      // 1. Verificación de seguridad: ¿Ya se marcó este día como completado en la BD?
      // Esto evita que al refrescar o volver atrás se reabra un día terminado.
      const isDone = await svc.isDayCompleted(clientId, dayId);
      if (isDone) {
        console.log('[WorkoutStore] El día ya está completado. Limpiando sesión...');
        sessionStorage.removeItem('active_workout');
        patchState(store, { activeLog: null });
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const saved = sessionStorage.getItem('active_workout');
      
      if (saved) {
        try {
          const log = JSON.parse(saved) as WorkoutLog;
          const logDateStr = new Date(log.loggedDate).toISOString().split('T')[0];

          // Recuperar solo si es el mismo cliente, mismo día y mismo día calendario
          if (log.dayId === dayId && log.clientId === clientId && logDateStr === todayStr && !log.completed) {
            console.log('[WorkoutStore] Recuperando sesión activa de hoy');
            patchState(store, { activeLog: { ...log, loggedDate: new Date(log.loggedDate) } });
            return;
          } else {
            console.log('[WorkoutStore] Descartando sesión antigua o de otro día');
            sessionStorage.removeItem('active_workout');
          }
        } catch (e) {
          console.error('[WorkoutStore] Error al validar sesión guardada', e);
          sessionStorage.removeItem('active_workout');
        }
      }

      // Si llegamos aquí, iniciamos una nueva sesión (solo si no estaba completada)
      console.log('[WorkoutStore] Iniciando nueva sesión de entrenamiento');
      const log: WorkoutLog = {
        id: uuid(),
        clientId,
        assignedRoutineId,
        routineId,
        dayId,
        loggedDate: new Date(),
        completed: false,
        sets: [],
        exerciseNotes: {},
      };
      patchState(store, { activeLog: log });
      sessionStorage.setItem('active_workout', JSON.stringify(log));
    },

    // Registrar una serie
    async logSet(set: Omit<SetLog, 'id'>): Promise<void> {
      const log = store.activeLog();
      if (!log) {
        console.warn('[WorkoutStore] No hay sesión activa para registrar la serie');
        return;
      }

      // CAPA 2: Verificación atómica antes de guardar
      const isBlocked = await svc.isDayCompleted(log.clientId, log.dayId);
      if (isBlocked) {
        console.warn('[WorkoutStore] El día se ha cerrado externamente. Abortando registro.');
        // ✅ AHORA: Solo lanzamos el error. El componente gestiona la limpieza de UI/Session.
        throw new WorkoutBlockedError();
      }

      // Copiar cualquier comentario pre-existente en la nueva serie
      const exerciseNote = log.exerciseNotes?.[set.exerciseId];
      const newSet: SetLog = { ...set, id: uuid(), notes: exerciseNote || undefined };

      // Limpiar notas en series anteriores del mismo ejercicio
      const updatedSets = log.sets.map(s => {
        if (s.exerciseId === set.exerciseId) {
          return { ...s, notes: undefined };
        }
        return s;
      });

      const updated = { ...log, sets: [...updatedSets, newSet] };
      console.log('[WorkoutStore] Serie registrada. Total series:', updated.sets.length, updated);
      patchState(store, { activeLog: updated });
      sessionStorage.setItem('active_workout', JSON.stringify(updated));
    },

    // Corregir el peso de una serie ya registrada
    updateSet(setId: string, weightKg: number, repsDone: number): void {
      const log = store.activeLog();
      if (!log) return;
      const updated = {
        ...log,
        sets: log.sets.map(s =>
          s.id === setId ? { ...s, weightKg, repsDone } : s
        ),
      };
      patchState(store, { activeLog: updated });
      sessionStorage.setItem('active_workout', JSON.stringify(updated));
    },

    removeSet(setId: string): void {
      console.log('[WorkoutStore] Intentando eliminar serie ID:', setId);
      const log = store.activeLog();
      if (!log) return;
      
      const updated = {
        ...log,
        sets: log.sets.filter(s => s.id !== setId),
      };
      
      console.log('[WorkoutStore] Serie eliminada. Quedan:', updated.sets.length);
      patchState(store, { activeLog: updated });
      sessionStorage.setItem('active_workout', JSON.stringify(updated));
    },

    updateExerciseNote(exerciseId: string, notes: string): void {
      const log = store.activeLog();
      if (!log) return;

      const exerciseNotes = { ...log.exerciseNotes, [exerciseId]: notes };

      const exerciseSets = log.sets.filter(s => s.exerciseId === exerciseId);
      let updatedSets = [...log.sets];

      if (exerciseSets.length > 0) {
        const lastSetId = exerciseSets[exerciseSets.length - 1].id;
        updatedSets = log.sets.map(s => {
          if (s.id === lastSetId) {
            return { ...s, notes: notes || undefined };
          }
          // Limpiar nota en series previas de este ejercicio para evitar duplicidades
          if (s.exerciseId === exerciseId && s.id !== lastSetId) {
            return { ...s, notes: undefined };
          }
          return s;
        });
      }

      const updated = { ...log, sets: updatedSets, exerciseNotes };
      patchState(store, { activeLog: updated });
      sessionStorage.setItem('active_workout', JSON.stringify(updated));
    },

    // Guardar en Supabase y limpiar el estado activo de forma offline-friendly
    async completeWorkout(dayLabel: string): Promise<void> {
      console.log('[WorkoutStore] completeWorkout INICIO (Offline-friendly)');
      const log = store.activeLog();
      const profile = auth.profile();
      if (!log || !profile) {
        console.warn('[WorkoutStore] completeWorkout ABORTADO: No hay log activo o perfil');
        return;
      }

      patchState(store, { loading: true });
      const completed: WorkoutLog = { ...log, completed: true };

      // 1. Calcular el XP de forma local e inmediata
      const daysXp = 10;
      const setsXp = log.sets.length;
      let progressXp = 0;

      const exerciseWeights = new Map<string, number>();
      log.sets.forEach(s => {
        const cur = exerciseWeights.get(s.exerciseId) ?? 0;
        if ((s.weightKg ?? 0) > cur) exerciseWeights.set(s.exerciseId, s.weightKg ?? 0);
      });

      exerciseWeights.forEach((weight, exId) => {
        const exerciseName = log.sets.find(s => s.exerciseId === exId)?.exerciseName;
        const name = exerciseName?.trim().toLowerCase();
        
        let lastSets: SetLog[] = [];
        for (const h of store.history()) {
          if (h.id === log.id) continue;
          const found = h.sets.filter(s => 
            s.exerciseId === exId || 
            (name && s.exerciseName.trim().toLowerCase() === name)
          );
          if (found.length > 0) {
            lastSets = found;
            break;
          }
        }
        
        if (lastSets.length > 0) {
          const lastMaxWeight = Math.max(...lastSets.map(s => s.weightKg ?? 0));
          if (weight > lastMaxWeight) {
            const improvement = weight - lastMaxWeight;
            progressXp += Math.floor(improvement * 50);
            console.log(`[RANK] Mejora local en ${exId} (${exerciseName}): +${improvement}kg = +${improvement * 50}XP`);
          }
        }
      });

      // 2. Actualizar el rango localmente en memoria de inmediato para dar feedback al atleta
      const curRank = rankSvc.athleteRank();
      if (curRank) {
        const totalXpToAdd = daysXp + setsXp + progressXp;
        const newTotal = curRank.xpTotal + totalXpToAdd;
        const prevFull = rankSvc.calcFullRank(curRank.xpTotal);
        const newFull = rankSvc.calcFullRank(newTotal);
        const newLevel = newFull.rank.level;
        
        const didLevelUp = newFull.rank.level > prevFull.rank.level;
        const didDivUp = !didLevelUp && newFull.division > prevFull.division;

        rankSvc.athleteRank.set({
          xpTotal: newTotal,
          rankLevel: newLevel,
          daysXp: curRank.daysXp + daysXp,
          setsXp: curRank.setsXp + setsXp,
          progressXp: curRank.progressXp + progressXp
        });

        if (didLevelUp || didDivUp) {
          const label = `${newFull.rank.name} ${newFull.divLabel}`;
          rankSvc.rankedUp.set(label);
          setTimeout(() => rankSvc.rankedUp.set(null), 4000);
        }
      }

      // 3. Crear el payload robusto para la cola de sincronización offline-first
      const payload = {
        workout: {
          id: log.id,
          client_id: log.clientId,
          assigned_routine_id: log.assignedRoutineId,
          routine_id: log.routineId,
          day_id: log.dayId,
          logged_date: log.loggedDate instanceof Date 
            ? log.loggedDate.toISOString() 
            : (log.loggedDate as any),
          completed: true
        },
        label: dayLabel,
        sets: log.sets.map(s => ({
          id: s.id,
          exercise_id: s.exerciseId,
          exercise_name: s.exerciseName,
          set_number: s.setNumber,
          weight_kg: s.weightKg,
          reps_done: s.repsDone,
          notes: s.notes || null,
          completed_at: s.completedAt instanceof Date 
            ? s.completedAt.toISOString() 
            : (s.completedAt as any) || new Date().toISOString()
        })),
        xp: {
          daysXp,
          setsXp,
          progressXp
        }
      };

      // 4. Encolar la sesión de entrenamiento completa
      try {
        console.log('[WorkoutStore] Encolando sesión de entrenamiento en la sync queue...');
        await syncQueue.enqueue('workout_session', payload);
      } catch (e) {
        console.error('[WorkoutStore] Error encolando la sesión de entrenamiento:', e);
      }

      console.log('[WorkoutStore] completeWorkout FIN (Encolado y guardado en local)');
      patchState(store, {
        activeLog: null,
        history: [completed, ...store.history()],
        loading: false,
      });
      sessionStorage.removeItem('active_workout');
    },

    async loadHistory(clientId: string): Promise<void> {
      patchState(store, { loading: true });
      const history = await svc.getClientHistory(clientId);
      patchState(store, { history, loading: false });
    },

    async isDayCompleted(clientId: string, dayId: string): Promise<boolean> {
      return await svc.isDayCompleted(clientId, dayId);
    },

    // Obtener el último peso registrado para este ejercicio en el historial
    getLastPerformance(exerciseId: string, exerciseName?: string): SetLog | null {
      const name = exerciseName?.trim().toLowerCase();
      // 1. Mirar en la sesión activa primero (por si ya hizo una serie antes)
      const activeSets = store.activeLog()?.sets ?? [];
      const lastActive = activeSets.filter(s => 
        s.exerciseId === exerciseId || 
        (name && s.exerciseName.trim().toLowerCase() === name)
      ).slice(-1)[0];
      if (lastActive) return lastActive;

      // 2. Si no, mirar en el historial
      for (const log of store.history()) {
        const set = log.sets.find(s => 
          s.exerciseId === exerciseId || 
          (name && s.exerciseName.trim().toLowerCase() === name)
        );
        if (set) return set;
      }
      return null;
    },

    clearActiveLog(): void {
      patchState(store, { activeLog: null });
    },

    allLogsForExercise(exerciseId: string, exerciseName?: string): { date: Date, sets: SetLog[] }[] {
      const name = exerciseName?.trim().toLowerCase();
      const results: { date: Date, sets: SetLog[] }[] = [];
      
      // Include active workout
      const active = store.activeLog();
      if (active) {
         const activeSets = active.sets.filter(s => 
           s.exerciseId === exerciseId || (name && s.exerciseName.trim().toLowerCase() === name)
         );
         if (activeSets.length > 0) {
            results.push({ date: active.loggedDate instanceof Date ? active.loggedDate : new Date(active.loggedDate), sets: activeSets });
         }
      }

      // Include history
      for (const log of store.history()) {
        const found = log.sets.filter(s => 
          s.exerciseId === exerciseId || (name && s.exerciseName.trim().toLowerCase() === name)
        );
        if (found.length > 0) {
          results.push({
             date: log.loggedDate instanceof Date ? log.loggedDate : new Date(log.loggedDate),
             sets: found
          });
        }
      }
      
      return results.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }))
);
