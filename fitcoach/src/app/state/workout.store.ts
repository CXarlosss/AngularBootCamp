import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { WorkoutLog, SetLog } from '../core/models/workout-log.model';
import { WorkoutService } from '../core/services/workout.service';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../core/auth/auth.service';
import { WorkoutEventsService } from '../core/services/workout-events.service';
import { RankService } from '../core/services/rank.service';

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
    rankSvc = inject(RankService)
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
      };
      patchState(store, { activeLog: log });
      sessionStorage.setItem('active_workout', JSON.stringify(log));
    },

    // Registrar una serie
    logSet(set: Omit<SetLog, 'id'>): void {
      const log = store.activeLog();
      if (!log) {
        console.warn('[WorkoutStore] No hay sesión activa para registrar la serie');
        return;
      }
      const newSet: SetLog = { ...set, id: uuid() };
      const updated = { ...log, sets: [...log.sets, newSet] };
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

    // Guardar en Supabase y limpiar el estado activo
    async completeWorkout(dayLabel: string): Promise<void> {
      console.log('[WorkoutStore] completeWorkout INICIO');
      const log = store.activeLog();
      const profile = auth.profile();
      if (!log || !profile) {
        console.warn('[WorkoutStore] completeWorkout ABORTADO: No hay log activo o perfil');
        return;
      }

      patchState(store, { loading: true });
      const completed = { ...log, completed: true };
      
      // 1. Guardar log detallado
      console.log('[WorkoutStore] Guardando log detallado...');
      await svc.saveWorkoutLog(completed);
      
      // 2. Finalizar sesión (marcar día y notificar)
      console.log('[WorkoutStore] Llamando a svc.finishWorkout...');
      await svc.finishWorkout(log.routineId, log.dayId, dayLabel);

      // 3. Sistema de Rangos: Calcular y otorgar XP
      const daysXp = 10;
      const setsXp = log.sets.length;
      let progressXp = 0;

      // Comparar con historial para ver mejoras (PRs)
      const exerciseWeights = new Map<string, number>();
      log.sets.forEach(s => {
        const cur = exerciseWeights.get(s.exerciseId) || 0;
        if (s.weightKg > cur) exerciseWeights.set(s.exerciseId, s.weightKg);
      });

      exerciseWeights.forEach((weight, exId) => {
        // Obtenemos el historial previo antes de este entrenamiento
        const lastPerf = store.history().find(h => h.id !== log.id)?.sets.find(s => s.exerciseId === exId);
        if (lastPerf && weight > lastPerf.weightKg) {
          const improvement = weight - lastPerf.weightKg;
          progressXp += Math.floor(improvement * 50);
          console.log(`[RankSystem] ¡Mejora en ${exId}! +${improvement}kg = +${improvement * 50}XP`);
        }
      });

      console.log(`[RankSystem] Otorgando XP: Días:${daysXp}, Series:${setsXp}, Progreso:${progressXp}`);
      console.log('[RANK] Antes de addXP — athleteRank:', rankSvc.athleteRank());
      await rankSvc.addXP({ daysXp, setsXp, progressXp });
      console.log('[RANK] Después de addXP — xp_total:', rankSvc.athleteRank()?.xpTotal);

      console.log('[WorkoutStore] completeWorkout FIN (éxito)');
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
    getLastPerformance(exerciseId: string): SetLog | null {
      // 1. Mirar en la sesión activa primero (por si ya hizo una serie antes)
      const activeSets = store.activeLog()?.sets ?? [];
      const lastActive = activeSets.filter(s => s.exerciseId === exerciseId).slice(-1)[0];
      if (lastActive) return lastActive;

      // 2. Si no, mirar en el historial
      for (const log of store.history()) {
        const set = log.sets.find(s => s.exerciseId === exerciseId);
        if (set) return set;
      }
      return null;
    }
  }))
);
