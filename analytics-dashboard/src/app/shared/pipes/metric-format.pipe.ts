import { Pipe, PipeTransform } from '@angular/core';
import { Metric } from '../../core/models/metric.model';

@Pipe({
  name: 'metricFormat',
  standalone: true,
  pure: true 
})
export class MetricFormatPipe implements PipeTransform {
  transform(value: number, unit: Metric['unit'], locale = 'es-ES'): string {
    if (value == null) return '—';

    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);

      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);

      default:
        return new Intl.NumberFormat(locale, {
          notation: value >= 1_000_000 ? 'compact' : 'standard'
        }).format(value);
    }
  }
}
