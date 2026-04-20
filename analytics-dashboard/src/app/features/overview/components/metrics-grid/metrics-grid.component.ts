import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricViewModel } from '../../../../core/models/metric.model';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metrics-grid">
      @for (metric of metrics; track metric.id; let i = $index) {
        <app-kpi-card 
          [metric]="metric" 
          class="metric-item"
          [style.animation-delay]="(i * 100) + 'ms'">
        </app-kpi-card>
      }
    </div>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 0.5rem 0;
    }

    .metric-item {
      opacity: 0;
      animation: fade-in-up 0.5s ease-out forwards;
    }

    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MetricsGridComponent {
  @Input({ required: true }) metrics: MetricViewModel[] = [];
}
