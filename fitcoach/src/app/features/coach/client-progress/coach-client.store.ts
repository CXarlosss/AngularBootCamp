import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { inject } from '@angular/core';
import { CoachClientService, ClientSnapshot } from '../../../core/services/coach-client.service';

interface CoachClientState {
  clientId: string | null;
  snapshot: ClientSnapshot | null;
  loading: boolean;
  error: string | null;
  selectedExercise: string | null;
  photoComparison: {
    beforeDate: string | null;
    afterDate: string | null;
  };
  activeSection: 'overview' | 'photos' | 'exercises' | 'notes';
  lastFetched: number | null; // timestamp para TTL
}

const initialState: CoachClientState = {
  clientId: null,
  snapshot: null,
  loading: false,
  error: null,
  selectedExercise: null,
  photoComparison: { beforeDate: null, afterDate: null },
  activeSection: 'overview',
  lastFetched: null
};

export const CoachClientStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  withComputed((store) => ({
    adherenceRate: () => {
      const adh = store.snapshot()?.adherence;
      if (!adh || adh.length === 0) return 0;
      return adh[0].rate;
    },
    
    isAtRisk: () => {
      const last = store.snapshot()?.last_workout;
      if (!last) return true;
      const daysSince = (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 3;
    },
    
    daysSinceLastWorkout: () => {
      const last = store.snapshot()?.last_workout;
      if (!last) return null;
      return Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
    },
    
    volumeChartData: () => {
      const trend = store.snapshot()?.volume_trend ?? [];
      return {
        labels: trend.map((v: any) => v.week).reverse(),
        datasets: [{
          label: 'Volumen Total (kg)',
          data: trend.map((v: any) => v.total_volume).reverse(),
          borderColor: '#3b82f6',
          tension: 0.4
        }]
      };
    },
    
    adherenceChartData: () => {
      const adh = store.snapshot()?.adherence ?? [];
      return {
        labels: adh.map((a: any) => a.week).reverse(),
        datasets: [{
          label: '% Adherencia',
          data: adh.map((a: any) => a.rate).reverse(),
          backgroundColor: adh.map((a: any) => a.rate >= 80 ? '#22c55e' : a.rate >= 50 ? '#eab308' : '#ef4444'),
          borderRadius: 4
        }]
      };
    },
    
    adherenceTrend: () => {
      const adh = store.snapshot()?.adherence;
      if (!adh || adh.length < 2) return 0;
      return adh[0].rate - adh[1].rate;
    },
    
    volumeTrend: () => {
      const vol = store.snapshot()?.volume_trend;
      if (!vol || vol.length < 2) return 0;
      const latest = vol[0].total_volume;
      const prev = vol[1].total_volume;
      return prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0;
    },
    
    photosIndex: () => {
      return store.snapshot()?.photos_index ?? [];
    }
  })),
  
  withMethods((store, coachClientService = inject(CoachClientService)) => ({
    loadClient: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((clientId) => {
          if (store.clientId() === clientId && store.lastFetched() && (Date.now() - store.lastFetched()! < 300000)) {
            return of(null).pipe(tap(() => patchState(store, { loading: false })));
          }
          
          return coachClientService.getClientProgressSnapshot(clientId).pipe(
            tap((snapshot) => {
              patchState(store, {
                clientId,
                snapshot,
                loading: false,
                lastFetched: Date.now(),
                error: null
              });
            }),
            catchError((err) => {
              patchState(store, { 
                loading: false, 
                error: 'No se pudo cargar el progreso del cliente.' 
              });
              return of(null);
            })
          );
        })
      )
    ),
    
    setSelectedExercise(exerciseName: string | null) {
      patchState(store, { selectedExercise: exerciseName });
    },
    
    setPhotoComparison(before: string | null, after: string | null) {
      patchState(store, { photoComparison: { beforeDate: before, afterDate: after } });
    },
    
    setActiveSection(section: CoachClientState['activeSection']) {
      patchState(store, { activeSection: section });
    },
    
    reset() {
      patchState(store, initialState);
    }
  }))
);
