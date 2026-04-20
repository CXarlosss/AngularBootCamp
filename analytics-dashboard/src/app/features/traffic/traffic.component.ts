import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrafficDataService, TrafficFilters } from './services/traffic-data.service';
import { TrafficFiltersComponent } from './components/traffic-filters/traffic-filters.component';
import { TrafficChartComponent } from './components/traffic-chart/traffic-chart.component';

@Component({
  selector: 'app-traffic',
  standalone: true,
  imports: [CommonModule, TrafficFiltersComponent, TrafficChartComponent],
  template: `
    <div class="traffic-wrapper">
      <div class="traffic-layout">
        <header class="dashboard-header">
          <div>
            <h2 class="dashboard-title">Traffic Analysis</h2>
            <p class="dashboard-subtitle">Deep dive into user acquisition and behavior</p>
          </div>
          <div class="header-actions">
            <button class="btn-action">Export Data</button>
          </div>
        </header>

        <section class="filters-section">
          <app-traffic-filters 
            (filtersChanged)="onFiltersChanged($event)"
          />
        </section>

        @if (trafficService.error$ | async; as error) {
          <div class="error-banner">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
        }

        <section class="chart-section">
          @if (trafficService.loading$ | async) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Fetching latest traffic data...</span>
            </div>
          } @else {
            <app-traffic-chart 
              [data]="(trafficService.trafficData$ | async) ?? []"
            />
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .traffic-wrapper {
      padding: 2rem 2.5rem;
      max-width: 1600px;
      margin: 0 auto;
      background: #f1f5f9;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(203, 213, 225, 0.6);
    }

    .dashboard-title {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 1.05rem;
    }

    .btn-action {
      background: white;
      border: 1px solid #cbd5e1;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      transform: translateY(-1px);
    }

    .filters-section {
      background: white;
      border: 1px solid rgba(226, 232, 240, 0.8);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }

    .chart-section {
      animation: fade-in-up 0.5s ease-out;
    }

    .error-banner {
      padding: 1rem 1.5rem;
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
      border-radius: 0 8px 8px 0;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }

    .loading-state {
      color: #64748b;
      padding: 4rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(79, 70, 229, 0.2);
      border-radius: 50%;
      border-top-color: #4f46e5;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fade-in-up {
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
export class TrafficComponent {
  protected trafficService = inject(TrafficDataService);

  onFiltersChanged(newFilters: Partial<TrafficFilters>): void {
    this.trafficService.updateFilters(newFilters);
  }
}
