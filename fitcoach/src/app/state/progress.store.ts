import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { ProgressService } from '../core/services/progress.service';

export interface ExerciseDataPoint {
  date:      Date;
  maxWeight: number;   // el peso máximo levantado ese día
  totalVol:  number;   // series × reps × peso
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
}

export const ProgressStore = signalStore(
  { providedIn: 'root' },
  withState<ProgressState>({
    exercises: [],
    selected:  null,
    adherence: [],
    photos:    [],
    loading:   false,
  }),

  withComputed((store) => ({
    selectedExercise: computed(() =>
      store.exercises().find(e => e.name === store.selected()) ?? store.exercises()[0] ?? null
    ),
    sets: computed(() => {
      const ex = store.exercises().find(e => e.name === store.selected()) ?? store.exercises()[0];
      return ex?.dataPoints.map(d => ({ ...d, weightKg: d.maxWeight })) ?? [];
    }),
    sessions: computed(() => {
      // Proxy de sesiones: el ejercicio con más registros
      return store.exercises().reduce((max, ex) =>
        ex.dataPoints.length > (max?.length ?? 0) ? ex.dataPoints : max,
        [] as ExerciseDataPoint[]
      );
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

    improvement: computed(() => {
      const sets = store.sets();
      if (sets.length < 2) return 0;
      const first = sets[0]?.weightKg ?? 0;
      const last  = sets[sets.length - 1]?.weightKg ?? 0;
      return Math.max(0, Math.round(last - first));
    }),

    totalSessions: computed(() => store.sessions()?.length ?? 0),

    chartData: computed(() => store.sets() ?? []),
  })),

  withMethods((store, svc = inject(ProgressService)) => ({

    async load(clientId: string): Promise<void> {
      patchState(store, { loading: true });
      const [exercises, adherence, photos] = await Promise.all([
        svc.getExerciseProgress(clientId),
        svc.getWeeklyAdherence(clientId),
        svc.getProgressPhotos(clientId),
      ]);
      patchState(store, {
        exercises,
        adherence,
        photos,
        selected: exercises[0]?.name ?? null,
        loading: false,
      });
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
