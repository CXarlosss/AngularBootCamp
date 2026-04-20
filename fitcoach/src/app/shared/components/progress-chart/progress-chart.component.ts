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
    <div class="chart-wrap">
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
    // Reaccionar a cambios en los datos con effect()
    effect(() => {
      const ex = this.exercise();
      // Esperar al siguiente tick para que el DOM exista
      if (ex) {
        setTimeout(() => {
          if (!this.chart) this.initChart();
          this.updateChart(ex);
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // Inicialización delegada al effect()
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    const ctx  = this.canvasRef.nativeElement.getContext('2d')!;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const labelColor  = isDark ? '#888780' : '#73726c';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [this.buildDataset([])] },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 400, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#2C2C2A' : '#fff',
            borderColor:     isDark ? '#444441' : '#D3D1C7',
            borderWidth:     0.5,
            titleColor:      isDark ? '#c2c0b6' : '#3d3d3a',
            bodyColor:       isDark ? '#888780' : '#73726c',
            padding:         10,
            callbacks: {
              label: (ctx: any) =>
                this.metric() === 'maxWeight'
                  ? `${ctx.parsed.y} kg`
                  : `${ctx.parsed.y.toLocaleString()} kg vol.`,
            },
          },
        },
        scales: {
          x: {
            grid:  { color: gridColor },
            ticks: { color: labelColor, font: { size: 11 } },
          },
          y: {
            grid:  { color: gridColor },
            ticks: {
              color: labelColor,
              font:  { size: 11 },
              callback: (v: number) =>
                this.metric() === 'maxWeight' ? `${v}kg` : `${v}`,
            },
          },
        },
      },
    });
  }

  private updateChart(ex: ExerciseProgress): void {
    if (!this.chart) return;
    const pts    = ex.dataPoints;
    const labels = pts.map(p =>
      p.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    );
    const values = pts.map(p =>
      this.metric() === 'maxWeight' ? p.maxWeight : Math.round(p.totalVol)
    );

    this.chart.data.labels           = labels;
    this.chart.data.datasets[0]      = this.buildDataset(values);
    this.chart.update('active');
  }

  private buildDataset(data: number[]) {
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      data,
      borderColor:     isDark ? '#85B7EB' : '#185FA5',
      backgroundColor: isDark ? 'rgba(133,183,235,0.08)' : 'rgba(24,95,165,0.06)',
      borderWidth:     1.5,
      pointRadius:     3,
      pointHoverRadius: 5,
      pointBackgroundColor: isDark ? '#85B7EB' : '#185FA5',
      tension:         0.35,
      fill:            true,
    };
  }
}
