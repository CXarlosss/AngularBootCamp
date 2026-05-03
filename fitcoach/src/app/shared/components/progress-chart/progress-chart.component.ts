import {
  Component, input, effect,
  ElementRef, ViewChild,
  ChangeDetectionStrategy, AfterViewInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { ExerciseProgress } from '../../../state/progress.store';

// Chart.js se importa en main.ts con registerables
declare const Chart: any;

@Component({
  selector: 'fc-progress-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap" style="position: relative; width: 100%; height: 280px; margin-top: 10px;">
      <canvas #chartCanvas></canvas>
    </div>
  `,
})
export class ProgressChartComponent implements AfterViewInit, OnDestroy {
  exercise = input.required<ExerciseProgress | null>();
  metric   = input<'maxWeight' | 'totalVol'>('maxWeight');

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart: any = null;

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      const ex = this.exercise();
      if (ex) {
        setTimeout(() => {
          if (!this.chart) this.initChart();
          this.updateChart(ex);
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialized by effect
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const labelColor = isDark ? 'rgba(255,255,255,0.4)' : '#666';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [this.buildDataset([], ctx)] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10, right: 10, bottom: 0, left: -5 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark ? '#1a1d24' : '#fff',
            titleColor: isDark ? '#fff' : '#000',
            bodyColor: isDark ? 'rgba(255,255,255,0.7)' : '#444',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: (ctx: any) => 
                this.metric() === 'maxWeight' 
                  ? `🚀 Récord: ${ctx.parsed.y} kg`
                  : `📊 Vol: ${ctx.parsed.y.toLocaleString()} kg`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: labelColor,
              font: { size: 10, weight: '600' },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5
            }
          },
          y: {
            min: 0,
            beginAtZero: true,
            grace: '15%',
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: labelColor,
              font: { size: 10, weight: '600' },
              maxTicksLimit: 6,
              callback: (v: any) => this.metric() === 'maxWeight' ? `${v}kg` : v >= 1000 ? `${(v/1000).toFixed(1)}k` : v
            }
          }
        }
      }
    });
  }

  private updateChart(ex: ExerciseProgress): void {
    if (!this.chart) return;
    const pts = ex.dataPoints;
    const labels = pts.map(p => 
      p.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    );
    const values = pts.map(p => 
      this.metric() === 'maxWeight' ? p.maxWeight : Math.round(p.totalVol)
    );

    this.chart.data.labels = labels;
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.chart.data.datasets[0] = this.buildDataset(values, ctx);
    this.chart.update('none'); // Update without animation for smoother data swaps
  }

  private buildDataset(data: number[], ctx: CanvasRenderingContext2D) {
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const color = isDark ? '#1D9E75' : '#158062';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, isDark ? 'rgba(29, 158, 117, 0.3)' : 'rgba(21, 128, 98, 0.2)');
    gradient.addColorStop(1, 'rgba(29, 158, 117, 0)');

    return {
      data,
      borderColor: color,
      borderWidth: 3.5,
      backgroundColor: gradient,
      fill: true,
      tension: 0.45,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: color,
      pointBorderColor: isDark ? '#080a0f' : '#fff',
      pointBorderWidth: 2.5,
      spanGaps: true
    };
  }
}
