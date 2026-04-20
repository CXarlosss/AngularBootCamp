import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrafficDataPoint } from '../../../../core/models/metric.model';

@Component({
  selector: 'app-traffic-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-container">
      @if (data.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📈</div>
          <p>No traffic data available for the selected filters.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  <div class="th-content">Time</div>
                </th>
                <th>
                  <div class="th-content">Sessions</div>
                </th>
                <th>
                  <div class="th-content">Bounce Rate</div>
                </th>
                <th>
                  <div class="th-content">Avg Duration</div>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (point of data; track point.timestamp; let i = $index) {
                <tr [style.animation-delay]="(i * 50) + 'ms'">
                  <td class="font-medium text-slate-800">{{ point.timestamp | date:'shortTime' }}</td>
                  <td>
                    <div class="metric-badge sessions">{{ point.sessions }}</div>
                  </td>
                  <td>
                    <div class="metric-baseline">
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill" [style.width]="point.bounceRate + '%'"
                             [class.warning]="point.bounceRate > 60"
                             [class.good]="point.bounceRate <= 60"></div>
                      </div>
                      <span>{{ point.bounceRate | number:'1.1-2' }}%</span>
                    </div>
                  </td>
                  <td class="font-medium text-indigo-600">{{ point.avgDuration }}s</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }
    
    .table-wrapper {
      max-height: 500px;
      overflow-y: auto;
    }

    .empty-state {
      color: #64748b;
      text-align: center;
      padding: 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .data-table th {
      background: #f8fafc;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .data-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      text-align: left;
      font-size: 0.875rem;
      color: #334155;
      transition: background-color 0.2s ease;
    }

    .data-table tbody tr {
      opacity: 0;
      animation: fade-in-row 0.4s ease forwards;
    }

    .data-table tbody tr:hover td {
      background-color: #f8fafc;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .font-medium {
      font-weight: 500;
    }

    .text-slate-800 {
      color: #1e293b;
    }

    .text-indigo-600 {
      color: #4f46e5;
    }

    .metric-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .metric-badge.sessions {
      background: #e0e7ff;
      color: #3730a3;
    }

    .metric-baseline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .progress-bar-bg {
      height: 6px;
      width: 60px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }

    .progress-bar-fill.warning {
      background: #f59e0b;
    }

    .progress-bar-fill.good {
      background: #10b981;
    }

    @keyframes fade-in-row {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TrafficChartComponent {
  @Input({ required: true }) data: TrafficDataPoint[] = [];
}
