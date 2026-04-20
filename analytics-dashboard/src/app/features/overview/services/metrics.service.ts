import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, of } from 'rxjs';
import { MetricViewModel } from '../../../core/models/metric.model';

@Injectable({ providedIn: 'root' })
export class MetricsService {
    private loadingSub = new BehaviorSubject<boolean>(false);
    private errorSub = new BehaviorSubject<string | null>(null);
    private metricsSub = new BehaviorSubject<MetricViewModel[]>([
      { id: 'active_users', label: 'Active Users', value: 1200, previousValue: 1000, unit: 'number', updatedAt: new Date(), trend: 'up', changePercent: 20, formattedValue: '1.2k' },
      { id: 'revenue', label: 'Revenue', value: 5000, previousValue: 5500, unit: 'currency', updatedAt: new Date(), trend: 'down', changePercent: -9, formattedValue: '€5.000' }
    ]);

    readonly isLoading$ = this.loadingSub.asObservable();
    readonly error$ = this.errorSub.asObservable();
    readonly metrics$ = this.metricsSub.pipe(shareReplay(1));
}
