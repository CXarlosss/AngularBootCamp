import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { WorkoutLog, SetLog } from '../core/models/workout-log.model';
import { WorkoutService } from '../core/services/workout.service';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../core/auth/auth.service';
import { WorkoutEventsService } from '../core/services/workout-events.service';

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
    events = inject(WorkoutEventsService)
  ) => ({

    // Iniciar un entrenamiento nuevo para hoy
    startWorkout(assignedRoutineId: string, clientId: string): void {
      // Intentar recuperar sesión guardada primero
      const saved = sessionStorage.getItem('active_workout');
      if (saved) {
        try {
          const log = JSON.parse(saved);
          if (log.assignedRoutineId === assignedRoutineId) {
            patchState(store, { activeLog: log });
            return;
          }
        } catch {}
      }

      const log: WorkoutLog = {
        id: crypto.randomUUID(),
        clientId,
        assignedRoutineId,
        loggedDate: new Date(),
        completed: false,
        sets: [],
      };
      patchState(store, { activeLog: log });
      sessionStorage.setItem('active_workout', JSON.stringify(log));
    },

    // Registrar una serie (el gesto más frecuente en la app)
    logSet(set: Omit<SetLog, 'id'>): void {
      const log = store.activeLog();
      if (!log) return;
      const newSet: SetLog = { ...set, id: crypto.randomUUID() };
      const updated = { ...log, sets: [...log.sets, newSet] };
      patchState(store, { activeLog: updated });
      sessionStorage.setItem('active_workout', JSON.stringify(updated));
    },

    // Corregir el peso de una serie ya registrada
    updateSet(setId: string, weightKg: number, repsDone: number): void {
      const log = store.activeLog();
      if (!log) return;
      patchState(store, {
        activeLog: {
          ...log,
          sets: log.sets.map(s =>
            s.id === setId ? { ...s, weightKg, repsDone } : s
          ),
        },
      });
    },

    // Guardar en Supabase y limpiar el estado activo
    async completeWorkout(): Promise<void> {
      const log = store.activeLog();
      const profile = auth.profile();
      if (!log || !profile) return;

      patchState(store, { loading: true });
      const completed = { ...log, completed: true };
      await svc.saveWorkoutLog(completed);

      // Emitir evento en lugar de llamar a ChatStore directamente
      if (profile.coachId) {
        const volume = completed.sets
          .reduce((s, set) => s + set.weightKg * set.repsDone, 0);
        events.emit({
          clientId:    profile.id,
          coachId:     profile.coachId,
          clientName:  profile.fullName,
          totalSets:   completed.sets.length,
          totalVolume: volume,
        });
      }

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
  }))
);
