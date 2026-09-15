import {
  Component, input, effect,
  ElementRef, ViewChild,
  ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  NgZone, inject, signal
} from '@angular/core';
import { ExerciseProgress } from '../../../state/progress.store';
import { ChartThemeService } from '../../../core/services/chart-theme.service';

declare const Chart: any;

@Component({
  selector: 'fc-progress-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-premium-wrap">
      <canvas #chartCanvas></canvas>
      @if (prValue() > 0) {
        <div class="chart-pr-badge">
          <span class="pr-dot"></span>
          <span>PR: {{ prValue() }}kg</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-premium-wrap {
      position: relative;
      width: 100%;
      height: 300px;
      margin-top: 16px;
    }

    .chart-pr-badge {
      position: absolute;
      top: 8px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--pr-badge-bg, rgba(251,191,36,0.1));
      border: 1px solid var(--pr-badge-border, rgba(251,191,36,0.2));
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: var(--pr-badge-color, #fbbf24);
      backdrop-filter: blur(8px);
      animation: prBadgeEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      animation-delay: 0.8s;
      opacity: 0;
    }

    @keyframes prBadgeEnter {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .pr-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
    }
  `]
})
export class ProgressChartComponent implements AfterViewInit, OnDestroy {
  exercise = input.required<ExerciseProgress | null>();
  metric = input<'maxWeight' | 'estimated1RM' | 'totalVol'>('estimated1RM');

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: any = null;
  private themeSvc = inject(ChartThemeService);
  prValue = signal(0);

  constructor(private ngZone: NgZone) {
    effect(() => {
      const ex = this.exercise();
      if (ex && this.chart) {
        this._updateChart(ex);
      }
    });

    // Reaccionar a cambios de tema
    effect(() => {
      this.themeSvc.tokens();
      if (this.chart) {
        this._applyTheme();
      }
    });
  }

  ngAfterViewInit(): void {
    const ex = this.exercise();
    if (ex) this._initChart(ex);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private _initChart(exercise: ExerciseProgress) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tokens = this.themeSvc.tokens();
    const data = this._prepareData(exercise);
    const pr = this._calculatePR(data);
    this.prValue.set(pr);

    this.ngZone.runOutsideAngular(() => {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: this._metricLabel(),
            data: data.values,
            borderColor: tokens.lineColor,
            borderWidth: tokens.lineWidth,
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return tokens.areaGradientStart;
              return this.themeSvc.createAreaGradient(ctx, chartArea);
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: tokens.pointColor,
            pointBorderColor: 'transparent',
            pointBorderWidth: 0,
            pointRadius: 4,
            pointHoverBackgroundColor: tokens.pointHoverColor,
            pointHoverBorderColor: tokens.pointHoverBorderColor,
            pointHoverBorderWidth: tokens.pointHoverBorderWidth,
            pointHoverRadius: tokens.pointHoverRadius,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: tokens.tooltipBg,
              titleColor: tokens.tooltipTitle,
              bodyColor: tokens.tooltipText,
              borderColor: tokens.tooltipBorder,
              borderWidth: 1,
              cornerRadius: 12,
              padding: 14,
              titleFont: { size: 13, weight: '700', family: 'inherit' },
              bodyFont: { size: 12, weight: '500', family: 'inherit' },
              displayColors: false,
              callbacks: {
                title: (items: any[]) => {
                  const date = new Date(items[0].label);
                  return date.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                },
                label: (item: any) => {
                  return `🏋️ ${item.raw} kg`;
                },
                afterLabel: (item: any) => {
                  const idx = item.dataIndex;
                  const entry = data.rawEntries[idx];
                  if (entry?.reps) return `💪 ${entry.reps} reps`;
                  return '';
                }
              }
            },
            annotation: {
              annotations: pr > 0 ? {
                prLine: {
                  type: 'line',
                  yMin: pr,
                  yMax: pr,
                  borderColor: tokens.prLineColor,
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: `PR ${pr}kg`,
                    position: 'end',
                    backgroundColor: tokens.prLabelBg,
                    color: tokens.prLabelColor,
                    font: { size: 10, weight: '700' },
                    borderRadius: 8,
                    padding: { x: 8, y: 4 }
                  }
                }
              } : {}
            }
          },
          scales: {
            x: {
              grid: {
                color: tokens.gridColor,
                drawBorder: false,
              },
              ticks: {
                color: tokens.tickColor,
                font: { size: 10, family: 'inherit' },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6
              },
              border: { display: false }
            },
            y: {
              grid: {
                color: tokens.gridColor,
                drawBorder: false,
              },
              ticks: {
                color: tokens.tickColor,
                font: { size: 10, family: 'inherit' },
                callback: (val: number) => val + 'kg'
              },
              border: { display: false },
              beginAtZero: false
            }
          },
          animation: {
            duration: 800,
            easing: 'easeOutQuart'
          }
        }
      });
    });
  }

  private _updateChart(exercise: ExerciseProgress) {
    const data = this._prepareData(exercise);
    const pr = this._calculatePR(data);
    this.prValue.set(pr);

    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.data.datasets[0].label = this._metricLabel();

    // Actualizar anotación PR
    if (this.chart.options.plugins.annotation) {
      this.chart.options.plugins.annotation.annotations = pr > 0 ? {
        prLine: {
          type: 'line',
          yMin: pr,
          yMax: pr,
          borderColor: this.themeSvc.tokens().prLineColor,
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: `PR ${pr}kg`,
            position: 'end',
            backgroundColor: this.themeSvc.tokens().prLabelBg,
            color: this.themeSvc.tokens().prLabelColor,
            font: { size: 10, weight: '700' },
            borderRadius: 8,
            padding: { x: 8, y: 4 }
          }
        }
      } : {};
    }

    this.chart.update('active');
  }

  private _applyTheme() {
    const tokens = this.themeSvc.tokens();
    const ds = this.chart.data.datasets[0];
    const opts = this.chart.options;

    ds.borderColor = tokens.lineColor;
    ds.pointBackgroundColor = tokens.pointColor;
    ds.pointHoverBackgroundColor = tokens.pointHoverColor;
    ds.pointHoverBorderColor = tokens.pointHoverBorderColor;

    opts.plugins.tooltip.backgroundColor = tokens.tooltipBg;
    opts.plugins.tooltip.titleColor = tokens.tooltipTitle;
    opts.plugins.tooltip.bodyColor = tokens.tooltipText;
    opts.plugins.tooltip.borderColor = tokens.tooltipBorder;
    opts.scales.x.grid.color = tokens.gridColor;
    opts.scales.x.ticks.color = tokens.tickColor;
    opts.scales.y.grid.color = tokens.gridColor;
    opts.scales.y.ticks.color = tokens.tickColor;

    this.chart.update('none');
  }

  private _prepareData(ex: ExerciseProgress) {
    const history = (ex as any).dataPoints || (ex as any).history || [];
    const sorted = [...history].sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sorted.map((h: any) => h.date),
      values: sorted.map((h: any) => {
        if (this.metric() === 'maxWeight') return h.maxWeight || h.weight || 0;
        if (this.metric() === 'totalVol') return h.totalVol || 0;
        return h.estimated1RM || h.maxWeight || h.weight || 0;
      }),
      rawEntries: sorted
    };
  }

  private _calculatePR(data: any): number {
    if (!data.values.length) return 0;
    return Math.max(...data.values);
  }

  private _metricLabel(): string {
    const map: Record<string, string> = {
      maxWeight: 'Carga máxima',
      estimated1RM: '1RM Estimado',
      totalVol: 'Volumen total'
    };
    return map[this.metric()] || 'Progreso';
  }
}
