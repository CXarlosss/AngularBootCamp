import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { TrafficDataPoint } from '../../../core/models/metric.model';

export interface TrafficFilters {
  dateRange: 'today' | '7d' | '30d' | '90d';
  source: 'all' | 'organic' | 'paid' | 'direct';
}

@Injectable({ providedIn: 'root' })
export class TrafficDataService {
  private http = inject(HttpClient);

  private filters$ = new BehaviorSubject<TrafficFilters>({
    dateRange: '7d',
    source: 'all'
  });

  public readonly loading$ = new BehaviorSubject<boolean>(false);
  public readonly error$ = new BehaviorSubject<string | null>(null);

  readonly trafficData$: Observable<TrafficDataPoint[]> = this.filters$.pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) => 
      prev.dateRange === curr.dateRange && prev.source === curr.source
    ),
    switchMap(filters => {
      this.loading$.next(true);
      this.error$.next(null);
      // FAKE HTTP request for the example:
      return this.http.get<TrafficDataPoint[]>('/api/traffic', { 
        params: { 
          range: filters.dateRange, 
          source: filters.source 
        } 
      }).pipe(
        catchError(err => {
          console.error('Traffic fetch failed:', err);
          this.error$.next('Failed to fetch load traffic data.');
          return of([]); 
        }),
        // Simulate finalize to set loading false
        switchMap(data => {
            this.loading$.next(false);
            return of(data);
        })
      );
    })
  );

  updateFilters(partial: Partial<TrafficFilters>): void {
    this.filters$.next({ ...this.filters$.value, ...partial });
  }
}
