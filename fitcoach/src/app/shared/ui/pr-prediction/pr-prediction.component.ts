import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRPrediction } from '../../../core/services/weight-suggestion.service';

@Component({
  selector: 'fc-pr-prediction',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (prediction(); as p) {
      <div class="prp-card">
        <!-- Header -->
        <div class="prp-header">
          <div class="prp-crystal">🔮</div>
          <div class="prp-header-text">
            <h3>Predicción de PR</h3>
            <span class="prp-confidence" [class.high]="p.confidence >= 70" [class.medium]="p.confidence >= 40 && p.confidence < 70" [class.low]="p.confidence < 40">
              Confianza: {{ p.confidence }}%
            </span>
          </div>
        </div>

        <!-- Métricas principales -->
        <div class="prp-stats">
          <div class="prp-stat">
            <span class="prp-stat-label">PR Actual</span>
            <span class="prp-stat-value">{{ p.currentPR }}kg</span>
          </div>
          <div class="prp-stat arrow">→</div>
          <div class="prp-stat highlight">
            <span class="prp-stat-label">PR Predicho</span>
            <span class="prp-stat-value gold">{{ p.predictedPR }}kg</span>
          </div>
          <div class="prp-stat">
            <span class="prp-stat-label">En</span>
            <span class="prp-stat-value">{{ p.weeksToPR }} semanas</span>
          </div>
        </div>

        <!-- Fecha estimada -->
        <div class="prp-date">
          <span class="prp-date-icon">📅</span>
          <span>Estimado: {{ p.predictedDate | date:'mediumDate' }}</span>
        </div>

        <!-- Gráfico de proyección -->
        <div class="prp-chart">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none">
            <!-- Grid lines -->
            @for (i of [0,1,2,3,4]; track i) {
              <line 
                x1="0" [attr.y1]="40 * i + 20" 
                x2="400" [attr.y2]="40 * i + 20"
                stroke="rgba(255,255,255,0.05)" 
                stroke-width="1"
              />
            }

            <!-- Área bajo la línea de tendencia -->
            <path 
              [attr.d]="trendAreaPath()"
              fill="url(#trendGradient)"
              opacity="0.3"
            />

            <!-- Línea de tendencia (proyección) -->
            <path 
              [attr.d]="trendLinePath()"
              fill="none"
              stroke="var(--c-green, #1D9E75)"
              stroke-width="2"
              stroke-dasharray="6,4"
              stroke-linecap="round"
            />

            <!-- Línea de PR actual -->
            <line 
              [attr.x1]="0" [attr.y1]="prY()"
              [attr.x2]="400" [attr.y2]="prY()"
              stroke="var(--c-gold, #fbbf24)"
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.6"
            />
            <text 
              [attr.x]="380" [attr.y]="prY() - 6"
              fill="var(--c-gold, #fbbf24)"
              font-size="10"
              text-anchor="end"
            >PR {{ p.currentPR }}kg</text>

            <!-- Puntos históricos -->
            @for (point of historicalPoints(); track $index) {
              <circle 
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r="5"
                fill="var(--c-green, #1D9E75)"
                stroke="#fff"
                stroke-width="2"
              />
            }

            <!-- Punto de PR predicho -->
            @if (predictedPoint(); as pp) {
              <circle 
                [attr.cx]="pp.x"
                [attr.cy]="pp.y"
                r="7"
                fill="var(--c-gold, #fbbf24)"
                stroke="#fff"
                stroke-width="2"
              />
              <text 
                [attr.x]="pp.x" [attr.y]="pp.y - 12"
                fill="var(--c-gold, #fbbf24)"
                font-size="11"
                font-weight="bold"
                text-anchor="middle"
              >{{ p.predictedPR }}kg</text>
            }

            <!-- Gradiente -->
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--c-green, #1D9E75)" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="var(--c-green, #1D9E75)" stop-opacity="0"/>
              </linearGradient>
            </defs>
          </svg>

          <!-- Eje X labels -->
          <div class="prp-x-labels">
            @for (label of xLabels(); track $index) {
              <span>{{ label }}</span>
            }
          </div>
        </div>

        <!-- Info de regresión -->
        <div class="prp-regression">
          <span class="prp-reg-item">
            📈 Tendencia: +{{ prediction()?.regressionData?.slope }}kg/semana
          </span>
          <span class="prp-reg-item">
            📊 R² = {{ prediction()?.regressionData?.r2 }}
          </span>
        </div>

        <!-- Motivación -->
        <div class="prp-motivation">
          @if (p.weeksToPR <= 2) {
            <span class="prp-motivation-text urgent">🔥 ¡Estás a {{ p.weeksToPR }} semanas de tu PR!</span>
          } @else if (p.weeksToPR <= 4) {
            <span class="prp-motivation-text">💪 Sigue así, tu PR está cerca</span>
          } @else {
            <span class="prp-motivation-text">📈 Consistencia = resultados</span>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './pr-prediction.component.scss'
})
export class PRPredictionComponent {
  prediction = input<PRPrediction | null>(null);

  readonly historicalPoints = computed(() => {
    const p = this.prediction();
    if (!p) return [];
    return this.calculatePoints(p.trendLine.slice(0, p.trendLine.length - p.weeksToPR - 1));
  });

  readonly predictedPoint = computed(() => {
    const p = this.prediction();
    if (!p || p.trendLine.length === 0) return null;
    const last = p.trendLine[p.trendLine.length - 1];
    return this.calculatePoint(last.week, last.weight);
  });

  readonly trendLinePath = computed(() => {
    const p = this.prediction();
    if (!p) return '';
    const points = this.calculatePoints(p.trendLine);
    return points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  });

  readonly trendAreaPath = computed(() => {
    const path = this.trendLinePath();
    if (!path) return '';
    return `${path} L 400 200 L 0 200 Z`;
  });

  readonly prY = computed(() => {
    const p = this.prediction();
    if (!p) return 100;
    return this.yToSvg(p.currentPR);
  });

  readonly xLabels = computed(() => {
    const p = this.prediction();
    if (!p) return [];
    const total = p.trendLine.length;
    const step = Math.ceil(total / 5);
    const labels: string[] = [];
    for (let i = 0; i < total; i += step) {
      labels.push(`S${p.trendLine[i].week}`);
    }
    return labels;
  });

  private calculatePoints(data: { week: number; weight: number }[]): { x: number; y: number }[] {
    return data.map(d => this.calculatePoint(d.week, d.weight));
  }

  private calculatePoint(week: number, weight: number): { x: number; y: number } {
    const p = this.prediction();
    if (!p) return { x: 0, y: 0 };

    const maxWeek = Math.max(...p.trendLine.map((t: any) => t.week));
    const allWeights = p.trendLine.map((t: any) => t.weight);
    const minWeight = Math.min(...allWeights) * 0.95;
    const maxWeight = Math.max(...allWeights) * 1.05;
    const range = maxWeight - minWeight || 1;

    return {
      x: (week / maxWeek) * 380 + 10,
      y: 190 - ((weight - minWeight) / range) * 170
    };
  }

  private yToSvg(weight: number): number {
    const p = this.prediction();
    if (!p) return 100;
    const allWeights = p.trendLine.map((t: any) => t.weight);
    const minWeight = Math.min(...allWeights) * 0.95;
    const maxWeight = Math.max(...allWeights) * 1.05;
    const range = maxWeight - minWeight || 1;
    return 190 - ((weight - minWeight) / range) * 170;
  }
}
