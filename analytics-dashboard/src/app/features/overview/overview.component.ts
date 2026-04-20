import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from './services/metrics.service';
import { MetricsGridComponent } from './components/metrics-grid/metrics-grid.component';
import { TrafficChartComponent } from '../traffic/components/traffic-chart/traffic-chart.component';
import { ActivityFeedComponent } from '../../shared/components/activity-feed/activity-feed.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    MetricsGridComponent, 
    TrafficChartComponent, 
    ActivityFeedComponent
  ],
  template: `
    <div class="overview-layout">
      <header class="dashboard-header">
        <div>
          <h2 class="dashboard-title">Overview Dashboard</h2>
          <p class="dashboard-subtitle">Monitor your key performance indicators in real-time</p>
        </div>
        <div class="header-actions">
          <button class="btn-action">Download Report</button>
        </div>
      </header>

      @if (metricsService.isLoading$ | async) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading summary data...</p>
        </div>
      }

      @if (metricsService.error$ | async; as error) {
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>
      }

      <!-- Critical Render: Top Metrics -->
      @if (metricsService.metrics$ | async; as metrics) {
        <section class="metrics-section">
          <app-metrics-grid [metrics]="metrics" />
        </section>
      }

      <div class="deferred-content-grid">
        <!-- Defer en Viewport -->
        <div class="widget-box widget-chart">
          <div class="widget-header">
            <h3>Traffic Overview</h3>
            <span class="badge">Live</span>
          </div>
          @defer (on viewport) {
            <!-- Usamos un array vacío o el real, importamos un componente pesado como TrafficChart -->
            <div class="widget-content">
              <app-traffic-chart [data]="[]" />
            </div>
          } @placeholder {
            <div class="placeholder-box">
              <span class="placeholder-icon">📊</span>
              <span>Scroll to view chart</span>
            </div>
          } @loading (minimum 500ms) {
            <div class="loading-box">
              <div class="spinner small"></div>
              <span>Loading chart data...</span>
            </div>
          } @error {
            <div class="error-box">Chart failed to load</div>
          }
        </div>

        <!-- Defer en el tiempo muerto del navegador -->
        <div class="widget-box widget-activity">
          <div class="widget-header">
            <h3>Recent Activity</h3>
            <span class="badge badge-secondary">Idle Load</span>
          </div>
          @defer (on idle) {
            <div class="widget-content">
              <app-activity-feed [events]="[]" />
            </div>
          } @placeholder {
            <div class="placeholder-box">Loading Virtual Scroll...</div>
          }
        </div>

        <!-- Defer a través de interacción de usuario -->
        <div class="widget-box widget-reports">
          <div class="widget-header">
            <h3>Detailed Reports Summary</h3>
          </div>
          <div class="widget-content centered-content">
            @defer (on interaction(loadReportsBtn)) {
              <div class="loaded-widget">
                <span class="success-icon">✨</span>
                <p>Summary loaded successfully!</p>
              </div>
            } @placeholder {
              <button #loadReportsBtn class="btn-load">
                <span>View Full Summary</span>
                <span class="btn-icon">→</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-layout { 
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

    .metrics-section {
      margin-bottom: 2rem;
    }

    .deferred-content-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
    }

    .widget-box {
      background: white;
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      transition: box-shadow 0.3s ease;
    }
    
    .widget-box:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .widget-chart { grid-column: span 8; }
    .widget-activity { grid-column: span 4; }
    .widget-reports { grid-column: span 12; }

    @media (max-width: 1024px) {
      .widget-chart, .widget-activity { grid-column: span 12; }
    }

    .widget-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .widget-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .badge-secondary {
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
    }

    .widget-content {
      padding: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .centered-content {
      align-items: center;
      justify-content: center;
      min-height: 150px;
    }

    .placeholder-box, .loading-box, .error-box {
      flex-grow: 1;
      background: #f8fafc;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      gap: 1rem;
    }

    .placeholder-icon {
      font-size: 2rem;
      opacity: 0.5;
    }

    .btn-load {
      padding: 0.8rem 1.75rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 9999px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn-load:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -2px rgba(59, 130, 246, 0.4);
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

    .loaded-widget {
      padding: 1.5rem 3rem;
      background: rgba(240, 253, 244, 0.7);
      border: 1px solid #bbf7d0;
      color: #166534;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(59, 130, 246, 0.2);
      border-radius: 50%;
      border-top-color: #3b82f6;
      animation: spin 1s ease-in-out infinite;
    }

    .spinner.small {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pop-in {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class OverviewComponent {
  protected metricsService = inject(MetricsService);
}
