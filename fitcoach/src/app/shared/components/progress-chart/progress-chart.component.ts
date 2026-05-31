import {
  Component, input, effect,
  ElementRef, ViewChild,
  ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  NgZone,
} from '@angular/core';
import { ExerciseProgress } from '../../../state/progress.store';
import type {
  ChartDataRequest,
  ChartDataResponse,
  WorkerError,
} from './progress-chart.worker';

// Chart.js registrado globalmente en main.ts
declare const Chart: any;

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * ProgressChartComponent (refactorizado)
 *
 * Cambios respecto a la versión original:
 *
 *  ANTES  → efecto Angular → map/fechas/gradientes → chart.update()  [todo en main thread]
 *  AHORA  → efecto Angular → postMessage al Worker → onmessage → chart.update()
 *                                                     ↑ solo esto en main thread
 *
 * El Worker hace el trabajo pesado (formateo de fechas, cálculo de valores,
 * gradient stops, detección de PRs). El main thread solo recibe datos listos
 * y se los pasa a Chart.js para renderizar.
 *
 * Compatibilidad: si el navegador no soporta Web Workers (muy raro en 2026)
 * el componente hace fallback automático al comportamiento original.
 */
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

  // ── Inputs (sin cambios) ────────────────────────────────────────────────

  exercise = input.required<ExerciseProgress | null>();
  metric   = input<'maxWeight' | 'totalVol'>('maxWeight');

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── Estado interno ──────────────────────────────────────────────────────

  private chart:  any    = null;
  private worker: Worker | null = null;

  // Evita actualizaciones solapadas si llegan dos señales seguidas
  private pendingUpdate = false;

  constructor(private ngZone: NgZone) {
    effect(() => {
      const ex = this.exercise();
      if (ex && this.canvasRef) {
        this._requestChartUpdate(ex);
      }
    });
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this._initWorker();

    // Si hay datos al montar el componente, lanzamos el primer render
    const ex = this.exercise();
    if (ex) this._requestChartUpdate(ex);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.worker?.terminate();
  }

  // ── Worker: inicialización ──────────────────────────────────────────────

  private _initWorker(): void {
    if (typeof Worker === 'undefined') {
      // Fallback: navegador sin soporte de Workers (muy raro)
      console.warn('[ProgressChart] Web Workers no disponibles. Usando fallback en main thread.');
      return;
    }

    // Angular CLI empaqueta el worker si el archivo se importa con este patrón
    this.worker = new Worker(
      new URL('./progress-chart.worker', import.meta.url),
      { type: 'module' }
    );

    // Escuchamos la respuesta del worker FUERA de NgZone para no disparar
    // detección de cambios innecesaria — solo entramos a la zona para chart.update()
    this.worker.onmessage = (event: MessageEvent<ChartDataResponse | WorkerError>) => {
      if (event.data.type === 'CHART_DATA_READY') {
        // Aplicar los datos procesados al gráfico en el main thread
        this.ngZone.runOutsideAngular(() => {
          this._applyChartData(event.data as ChartDataResponse);
        });
      } else if (event.data.type === 'WORKER_ERROR') {
        console.error('[ProgressChart] Worker error:', (event.data as WorkerError).message);
      }
      this.pendingUpdate = false;
    };

    this.worker.onerror = (err) => {
      console.error('[ProgressChart] Worker falló:', err);
      this.pendingUpdate = false;
    };
  }

  // ── Enviar datos al worker para procesamiento ───────────────────────────

  private _requestChartUpdate(ex: ExerciseProgress): void {
    if (this.pendingUpdate) return; // Evitar cola de mensajes acumulados
    this.pendingUpdate = true;

    if (!this.worker) {
      // Fallback síncrono si no hay worker
      this._fallbackUpdate(ex);
      return;
    }

    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;

    const request: ChartDataRequest = {
      type: 'PROCESS_CHART_DATA',
      payload: {
        // Convertimos Date a string ISO — los objetos Date no son transferibles
        dataPoints: ex.dataPoints.map(p => ({
          date:      p.date instanceof Date ? p.date.toISOString() : p.date,
          maxWeight: p.maxWeight,
          totalVol:  p.totalVol,
        })),
        metric: this.metric(),
        locale: 'es-ES',
        isDark,
      },
    };

    this.worker.postMessage(request);
  }

  // ── Aplicar datos procesados → Chart.js (main thread, mínimo trabajo) ──

  private _applyChartData(response: ChartDataResponse): void {
    const { labels, values, gradientStops, prIndices, min, max } = response.payload;

    if (!this.chart) {
      this._initChart(labels, values, gradientStops, prIndices);
    } else {
      // Actualizar datos existentes
      this.chart.data.labels = labels;

      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.chart.data.datasets[0] = this._buildDataset(values, ctx, gradientStops, prIndices);

      // 'none' desactiva animación en actualizaciones de datos para evitar janks
      this.chart.update('none');
    }
  }

  // ── Inicializar instancia Chart.js ──────────────────────────────────────

  private _initChart(
    labels:        string[],
    values:        number[],
    gradientStops: ChartDataResponse['payload']['gradientStops'],
    prIndices:     number[],
  ): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const labelColor = isDark ? 'rgba(255,255,255,0.4)'  : '#666';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [this._buildDataset(values, ctx, gradientStops, prIndices)],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, right: 10, bottom: 0, left: -5 } },
        plugins: {
          legend:  { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.parsed.y} kg`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: labelColor, maxTicksLimit: 6 },
            grid:  { color: gridColor },
          },
          y: {
            ticks: { color: labelColor },
            grid:  { color: gridColor },
          },
        },
      },
    });
  }

  // ── Construir dataset con gradiente ────────────────────────────────────

  private _buildDataset(
    data:          number[],
    ctx:           CanvasRenderingContext2D,
    gradientStops: ChartDataResponse['payload']['gradientStops'],
    prIndices:     number[],
  ) {
    // Gradiente de fondo calculado por el worker, aplicado aquí donde tenemos el ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradientStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));

    // Puntos PR destacados con color diferente
    const pointColors = data.map((_, i) =>
      prIndices.includes(i) ? '#F6AD55' : 'rgba(99,179,237,0.8)'
    );
    const pointRadii = data.map((_, i) =>
      prIndices.includes(i) ? 5 : 3
    );

    return {
      data,
      fill:            true,
      backgroundColor: gradient,
      borderColor:     'rgba(99,179,237,1)',
      borderWidth:     2,
      tension:         0.4,
      pointBackgroundColor: pointColors,
      pointRadius:          pointRadii,
      pointHoverRadius:     6,
    };
  }

  // ── Fallback síncrono (sin worker) ──────────────────────────────────────

  private _fallbackUpdate(ex: ExerciseProgress): void {
    // Comportamiento idéntico al original para navegadores sin Worker support
    setTimeout(() => {
      if (!this.chart) {
        this._initChart([], [], [], []);
      }

      const pts    = ex.dataPoints;
      const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
      const labels = pts.map(p =>
        p.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      );
      const values = pts.map(p =>
        this.metric() === 'maxWeight' ? p.maxWeight : Math.round(p.totalVol)
      );
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      const defaultStops = isDark
        ? [{ offset: 0, color: 'rgba(99,179,237,0.35)' }, { offset: 1, color: 'rgba(99,179,237,0)' }]
        : [{ offset: 0, color: 'rgba(49,130,206,0.20)' }, { offset: 1, color: 'rgba(49,130,206,0)' }];

      this.chart.data.labels        = labels;
      this.chart.data.datasets[0]   = this._buildDataset(values, ctx, defaultStops, []);
      this.chart.update('none');
      this.pendingUpdate = false;
    }, 0);
  }
}
