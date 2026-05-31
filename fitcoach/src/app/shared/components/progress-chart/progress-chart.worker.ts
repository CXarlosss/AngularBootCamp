/**
 * progress-chart.worker.ts
 *
 * Web Worker dedicado al procesamiento de datos del gráfico de progreso.
 * Se ejecuta fuera del main thread, eliminando el jank en móviles gama media.
 *
 * Responsabilidades:
 *  - Formatear fechas (toLocaleDateString es sorprendentemente costoso en bucles)
 *  - Calcular valores según la métrica seleccionada (maxWeight / totalVol)
 *  - Calcular los gradient stops normalizados (min/max del dataset)
 *  - Detectar PRs (Personal Records) para los puntos destacados
 *
 * NO instancia Chart.js — eso se mantiene en el main thread.
 *
 * Protocolo de mensajes:
 *  INPUT  → MessageType: 'PROCESS_CHART_DATA'  (ver ChartDataRequest)
 *  OUTPUT → MessageType: 'CHART_DATA_READY'    (ver ChartDataResponse)
 *  OUTPUT → MessageType: 'WORKER_ERROR'         (en caso de fallo)
 */

// ─── Tipos de mensajes ────────────────────────────────────────────────────────

export interface DataPoint {
  date:         string; // ISO string — Date no es transferible entre workers
  maxWeight:    number;
  estimated1RM: number;
  totalVol:     number;
}

export interface ChartDataRequest {
  type:     'PROCESS_CHART_DATA';
  payload: {
    dataPoints: DataPoint[];
    metric:     'maxWeight' | 'estimated1RM' | 'totalVol';
    locale:     string;   // ej. 'es-ES'
    isDark:     boolean;
  };
}

export interface GradientStop {
  offset: number; // 0.0 – 1.0
  color:  string;
}

export interface ChartDataResponse {
  type:    'CHART_DATA_READY';
  payload: {
    labels:        string[];
    values:        number[];
    gradientStops: GradientStop[];
    prIndices:     number[];   // Índices de puntos que son un PR (para destacarlos)
    min:           number;
    max:           number;
  };
}

export interface WorkerError {
  type:    'WORKER_ERROR';
  message: string;
}

// ─── Lógica de procesamiento ──────────────────────────────────────────────────

function processChartData(req: ChartDataRequest): ChartDataResponse['payload'] {
  const { dataPoints, metric, locale, isDark } = req.payload;

  if (!dataPoints.length) {
    return { labels: [], values: [], gradientStops: [], prIndices: [], min: 0, max: 0 };
  }

  // 1. Formatear fechas (operación costosa en bucle → aquí no bloquea UI)
  const labels = dataPoints.map(p =>
    new Date(p.date).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
  );

  // 2. Extraer valores según métrica
  const values = dataPoints.map(p => {
    if (metric === 'maxWeight') return p.maxWeight;
    if (metric === 'estimated1RM') return p.estimated1RM;
    return Math.round(p.totalVol);
  });

  // 3. Calcular min/max para el gradiente y los ejes
  const min = Math.min(...values);
  const max = Math.max(...values);

  // 4. Detectar PRs: índices donde el valor es el máximo acumulado hasta ese punto
  const prIndices: number[] = [];
  let runningMax = -Infinity;
  values.forEach((v, i) => {
    if (v > runningMax) {
      runningMax = v;
      // Solo marcamos como PR si no es el primer punto (el primero es trivialmente el "máximo")
      if (i > 0) prIndices.push(i);
    }
  });

  // 5. Calcular gradient stops normalizados
  //    El gradiente va de arriba (max, color fuerte) a abajo (min, color tenue)
  const gradientStops: GradientStop[] = isDark
    ? [
        { offset: 0,   color: 'rgba(99, 179, 237, 0.35)' },  // azul claro con opacidad
        { offset: 0.6, color: 'rgba(99, 179, 237, 0.08)' },
        { offset: 1,   color: 'rgba(99, 179, 237, 0.00)' },
      ]
    : [
        { offset: 0,   color: 'rgba(49, 130, 206, 0.20)' },  // azul oscuro con opacidad
        { offset: 0.6, color: 'rgba(49, 130, 206, 0.05)' },
        { offset: 1,   color: 'rgba(49, 130, 206, 0.00)' },
      ];

  return { labels, values, gradientStops, prIndices, min, max };
}

// ─── Message handler ──────────────────────────────────────────────────────────

self.addEventListener('message', (event: MessageEvent<ChartDataRequest>) => {
  try {
    if (event.data?.type !== 'PROCESS_CHART_DATA') return;

    const result = processChartData(event.data);

    const response: ChartDataResponse = {
      type:    'CHART_DATA_READY',
      payload: result,
    };

    self.postMessage(response);

  } catch (err) {
    const error: WorkerError = {
      type:    'WORKER_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(error);
  }
});
