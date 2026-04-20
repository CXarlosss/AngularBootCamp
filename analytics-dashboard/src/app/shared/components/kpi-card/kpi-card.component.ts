import { 
  Component, 
  Input, 
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricViewModel } from '../../../core/models/metric.model';
import { MetricFormatPipe } from '../../pipes/metric-format.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MetricFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="kpi-card" 
      [class.kpi-card--highlighted]="highlighted"
      [class.kpi-card--trend-up]="metric.trend === 'up'"
      [class.kpi-card--trend-down]="metric.trend === 'down'"
      [class.kpi-card--trend-neutral]="metric.trend === 'neutral'"
    >
      <span class="kpi-card__label">{{ metric.label }}</span>

      <div class="kpi-card__value-row">
        <span class="kpi-card__value">{{ metric.value | metricFormat:metric.unit }}</span>
        
        @if (metric.trend !== 'neutral') {
          <span class="kpi-card__trend">
            <span class="trend-icon">{{ metric.trend === 'up' ? '▲' : '▼' }}</span>
            {{ metric.changePercent | number:'1.1-1' }}%
          </span>
        } @else {
          <span class="kpi-card__trend kpi-card__trend--neutral">
            — 0.0%
          </span>
        }
      </div>

      <div class="kpi-card__footer">
        <span class="kpi-card__updated">
          Actualizado {{ metric.updatedAt | date:'HH:mm:ss' }}
        </span>
        <div class="kpi-card__pulse"></div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      padding: 1.75rem;
      border-radius: 16px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 1;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2;
    }

    .kpi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1), 0 8px 16px -6px rgba(0, 0, 0, 0.05);
      border-color: rgba(59, 130, 246, 0.3);
    }
    
    .kpi-card:hover::before {
      opacity: 1;
    }

    .kpi-card--highlighted {
      background: linear-gradient(145deg, #eff6ff 0%, #ffffff 100%);
      border-color: #bfdbfe;
    }

    .kpi-card--highlighted::before {
      opacity: 1;
      background: linear-gradient(90deg, #2563eb, #3b82f6);
    }

    .kpi-card__trend {
      font-size: 0.875rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.35rem 0.6rem;
      border-radius: 20px;
      transition: background-color 0.3s ease;
    }

    .trend-icon {
      font-size: 0.75rem;
    }

    .kpi-card--trend-up .kpi-card__trend { 
      color: #059669; 
      background: rgba(16, 185, 129, 0.1);
    }
    
    .kpi-card--trend-down .kpi-card__trend { 
      color: #e11d48; 
      background: rgba(225, 29, 72, 0.1);
    }

    .kpi-card__trend--neutral {
      color: #64748b;
      background: rgba(100, 116, 139, 0.1);
    }

    .kpi-card__label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .kpi-card__value {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .kpi-card__value-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-grow: 1;
    }

    .kpi-card__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(226, 232, 240, 0.6);
    }

    .kpi-card__updated {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .kpi-card__pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }
  `]
})
export class KpiCardComponent {
  @Input({ required: true }) metric!: MetricViewModel;
  @Input() highlighted = false;
}
