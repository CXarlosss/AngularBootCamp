import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { ProgressService } from '../core/services/progress.service';

export interface ExerciseDataPoint {
  date:         Date;
  maxWeight:    number;   // el peso máximo levantado ese día
  estimated1RM: number;   // 1RM estimado (fórmula Epley)
  totalVol:     number;   // series × reps × peso
}

export interface ExerciseProgress {
  name:       string;
  dataPoints: ExerciseDataPoint[];
}

export interface ProgressPhoto {
  id:      string;
  url:     string;
  takenAt: Date;
}

interface ProgressState {
  exercises:   ExerciseProgress[];
  selected:    string | null;       // nombre del ejercicio seleccionado en el gráfico
  adherence:   number[];            // 0–100 por semana (últimas 8 semanas)
  photos:      ProgressPhoto[];     // Objetos de foto con metadata
  loading:     boolean;
  weightImprovedKg: number | null;  // null = sin cargar, 0 puede ser dato real
  error:       string | null;
}

export const ProgressStore = signalStore(
  { providedIn: 'root' },
  withState<ProgressState>({
    exercises: [],
    selected:  null,
    adherence: [],
    photos:    [],
    loading:   false,
    weightImprovedKg: null,
    error:     null,
  }),

  withComputed((store) => ({
    selectedExercise: computed(() =>
      store.exercises().find(e => e.name === store.selected()) ?? store.exercises()[0] ?? null
    ),
    sets: computed(() => {
      const ex = store.exercises().find(e => e.name === store.selected()) ?? store.exercises()[0];
      return ex?.dataPoints.map(d => ({ ...d, weightKg: d.maxWeight, estimated1RM: d.estimated1RM })) ?? [];
    }),
    sessions: computed(() => {
      // Proxy de sesiones: el ejercicio con más registros
      return store.exercises().reduce((max, ex) =>
        ex.dataPoints.length > (max?.length ?? 0) ? ex.dataPoints : max,
        [] as ExerciseDataPoint[]
      );
    }),

    groupedHistory: computed(() => {
      const ex = store.exercises().find(e => e.name === store.selected()) ?? store.exercises()[0] ?? null;
      if (!ex) return [];

      // Agrupar por fecha para el histórico de carga
      const groups = new Map<string, { date: Date; maxWeight: number; estimated1RM: number; totalVol: number; sets: number }>();
      
      ex.dataPoints.forEach((dp: ExerciseDataPoint) => {
        const d = new Date(dp.date);
        const key = d.toISOString().split('T')[0];
        const existing = groups.get(key);
        
        if (existing) {
          existing.maxWeight = Math.max(existing.maxWeight, dp.maxWeight);
          existing.estimated1RM = Math.max(existing.estimated1RM, dp.estimated1RM);
          existing.totalVol += dp.totalVol;
          existing.sets += 1;
        } else {
          groups.set(key, { 
            date: dp.date, 
            maxWeight: dp.maxWeight, 
            estimated1RM: dp.estimated1RM,
            totalVol: dp.totalVol,
            sets: 1
          });
        }
      });

      return [...groups.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
    })
  })),

  withComputed((store) => ({
    adherencePct: computed(() => {
      const a = store.adherence();
      if (!a.length) return 0;
      return Math.round(a.reduce((s: number, v: number) => s + v, 0) / a.length);
    }),

    adherenceWeeks: computed(() => {
      const a = store.adherence();
      return a.map((pct: number, i: number) => ({
        pct,
        label: `S${a.length - i}`,
      }));
    }),

    maxWeight: computed(() => {
      const sets = store.sets();
      if (!sets.length) return 0;
      return Math.max(...sets.map((s: any) => s.weightKg ?? 0));
    }),

    max1RM: computed(() => {
      const sets = store.sets();
      if (!sets.length) return 0;
      return Math.max(...sets.map((s: any) => s.estimated1RM ?? 0));
    }),

    improvement: computed(() => {
      const sets = store.sets();
      if (sets.length < 2) return 0;
      
      const weights = sets.map(s => s.weightKg ?? 0).filter(w => w > 0);
      if (weights.length < 2) return 0;
      
      // Progreso = (peso máximo levantado históricamente) - (primer peso registrado)
      const firstWeight = weights[0];
      const maxWeight = Math.max(...weights);
      
      const diff = maxWeight - firstWeight;
      return Math.max(0, Math.round(diff * 10) / 10);
    }),

    totalSessions: computed(() => store.sessions()?.length ?? 0),

    chartData: computed(() => store.sets() ?? []),

    weightImprovedDisplay: computed(() => {
      const value = store.weightImprovedKg();
      if (value === null) return null;       // skeleton/spinner
      return value;                          // 0 solo si es dato real
    }),

    hasImprovement: computed(() => (store.weightImprovedKg() ?? 0) > 0),

    closeToPr: computed(() => {
      const exercises = store.exercises();
      if (!exercises.length) return null;

      let closest = null;
      let minDiff = Infinity;

      for (const ex of exercises) {
        if (!ex.dataPoints || ex.dataPoints.length < 2) continue;

        const sorted = [...ex.dataPoints].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastSession = sorted[0];
        
        const historicalMax = Math.max(...ex.dataPoints.map(dp => dp.maxWeight));
        const diff = historicalMax - lastSession.maxWeight;
        
        if (diff > 0 && diff <= 5) {
          if (diff < minDiff) {
            minDiff = diff;
            closest = {
              exerciseName: ex.name,
              diffKg: diff
            };
          }
        }
      }

      return closest;
    }),
  })),

  withMethods((store, svc = inject(ProgressService)) => ({

    async load(clientId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const [exercises, adherence, photos, weightImproved] = await Promise.all([
          svc.getExerciseProgress(clientId),
          svc.getWeeklyAdherence(clientId),
          svc.getProgressPhotos(clientId),
          svc.getWeightImprovedKg(clientId),
        ]);
        patchState(store, {
          exercises,
          adherence,
          photos,
          weightImprovedKg: weightImproved,
          selected: exercises[0]?.name ?? null,
          loading: false,
        });
      } catch (e) {
        patchState(store, { error: 'Error cargando progreso', loading: false });
      }
    },

    async loadWeightImproved(clientId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const kg = await svc.getWeightImprovedKg(clientId);
        patchState(store, { weightImprovedKg: kg, loading: false });
      } catch (e) {
        patchState(store, { error: 'Error cargando progreso', loading: false });
      }
    },

    selectExercise(name: string): void {
      patchState(store, { selected: name });
    },

    async uploadPhoto(clientId: string, file: File): Promise<void> {
      const url = await svc.uploadPhoto(clientId, file);
      patchState(store, { photos: [...store.photos(), url] });
    },
  }))
);
