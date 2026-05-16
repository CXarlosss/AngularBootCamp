import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ClientKPIs, WeekDay, ExerciseProgress } from '../../client-detail.types';
import { WeightChartComponent, WeightEntry } from '../../../../../shared/components/weight-chart/weight-chart.component';

@Component({
  selector: 'app-client-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe, WeightChartComponent],
  template: `
    <div class="summary-grid">
      <!-- KPIs -->
      <div class="kpi-card">
        <span class="label">Adherencia (6 sem)</span>
        <div class="value-row">
          <span class="value">{{ kpis?.adherencePercent }}%</span>
          <span class="delta" [class.pos]="(kpis?.adherenceDelta ?? 0) >= 0">
            {{ (kpis?.adherenceDelta ?? 0) > 0 ? '+' : '' }}{{ kpis?.adherenceDelta }}%
          </span>
        </div>
        <div class="sub">{{ kpis?.daysCompleted }}/{{ kpis?.daysTotal }} días</div>
      </div>

      <div class="kpi-card">
        <span class="label">Peso Actual</span>
        <div class="value-row">
          <span class="value">{{ kpis?.currentWeight != null ? (kpis?.currentWeight | number:'1.0-1') + 'kg' : '---' }}</span>
          @if (kpis?.weightDelta != null) {
            <span class="delta" [class.pos]="(kpis?.weightDelta ?? 0) < 0">
              {{ (kpis?.weightDelta ?? 0) > 0 ? '↑' : '↓' }}
              {{ kpis?.weightDelta | number:'1.0-1' }}kg
            </span>
          }
        </div>
        <div class="sub">Últimos 30 días</div>
      </div>
      <div class="kpi-card">
        <span class="label">Racha</span>
        <div class="value-row">
          <span class="value">{{ kpis?.currentStreak }}</span>
        </div>
        <div class="sub">Entrenamientos seguidos</div>
      </div>

      <div class="kpi-card" [class.alert]="isInactive()">
        <span class="label">Última Actividad</span>
        <div class="value-row">
          <span class="value">{{ kpis?.lastWorkoutDate ? (kpis?.lastWorkoutDate | date:'d MMM') : '---' }}</span>
          @if (isInactive()) {
            <span class="alert-tag">INACTIVO</span>
          }
        </div>
        <div class="sub">{{ inactiveDays() }} días sin log</div>
      </div>

      <!-- Weight Evolution Chart -->
      <div class="section-card chart-section">
        <app-weight-chart [entries]="weightHistory" />
      </div>

      <!-- Weekly Calendar -->
      <div class="section-card calendar-section">
        <h3>Actividad Semanal</h3>
        <div class="week-row">
          @for (day of weekDays; track day.label) {
            <div class="day-col" [class]="day.status">
              <span class="day-label">{{ day.label }}</span>
              <div class="dot"></div>
            </div>
          }
        </div>
      </div>

      <!-- Best Lifts -->
      <div class="section-card lifts-section">
        <h3>Mejores Marcas</h3>
        <div class="lifts-list">
          @for (ex of exerciseProgress; track ex.name) {
            <div class="lift-item">
              <div class="lift-info">
                <span class="name">{{ ex.name }}</span>
                <span class="meta">hace {{ ex.daysAgo }} días</span>
              </div>
              <div class="lift-val">
                <span class="weight">{{ ex.bestWeight }}kg</span>
                <span class="delta" [class.pos]="ex.delta > 0">
                  {{ ex.delta > 0 ? '↑' : '' }}{{ ex.delta }}
                </span>
              </div>
            </div>
          } @empty {
            <p class="empty">No hay ejercicios registrados</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; }
    
    .kpi-card { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); }
    .label { color: #888; font-size: 13px; font-weight: 500; display: block; margin-bottom: 8px; }
    .value-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
    .value { font-size: 28px; font-weight: 800; color: white; }
    .delta { font-size: 13px; font-weight: 600; padding: 2px 6px; border-radius: 6px; background: rgba(255,255,255,0.1); }
    .pos { color: #1D9E75; background: rgba(29, 158, 117, 0.1); }
    .neg { color: #E74C3C; background: rgba(231, 76, 60, 0.1); }
    .sub { color: #666; font-size: 12px; }

    .kpi-card.alert { border-color: rgba(231, 76, 60, 0.3); background: rgba(231, 76, 60, 0.05); }
    .alert-tag { background: #E74C3C; color: white; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; margin-left: 8px; }
    .alert .value { color: #E74C3C; }
    .alert .label { color: rgba(231, 76, 60, 0.6); }

    .section-card { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 24px; grid-column: span 2; border: 1px solid rgba(255,255,255,0.05); }
    h3 { margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #ccc; }

    .week-row { display: flex; justify-content: space-between; }
    .day-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .day-label { font-size: 12px; color: #666; font-weight: 600; }
    .dot { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); transition: 0.3s; }
    
    .done .dot { background: #1D9E75; border-color: #1D9E75; box-shadow: 0 0 12px rgba(29, 158, 117, 0.3); }
    .missed .dot { background: rgba(231, 76, 60, 0.2); border-color: rgba(231, 76, 60, 0.3); }
    .done .day-label { color: #1D9E75; }

    .lifts-list { display: flex; flex-direction: column; gap: 12px; }
    .lift-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; }
    .lift-info { display: flex; flex-direction: column; }
    .name { font-weight: 600; color: white; }
    .meta { font-size: 11px; color: #666; }
    .lift-val { text-align: right; }
    .weight { font-weight: 800; color: white; display: block; }
    .unit { font-size: 14px; color: #888; margin-left: 4px; }
  `]
})
export class ClientSummaryComponent {
  @Input() kpis: ClientKPIs | null = null;
  @Input() weekDays: WeekDay[] = [];
  @Input() exerciseProgress: ExerciseProgress[] = [];
  @Input() weightHistory: WeightEntry[] = [];
  @Input() loading = false;
  @Input() clientId = '';

  inactiveDays(): number {
    if (!this.kpis?.lastWorkoutDate) return 0;
    const diff = Date.now() - new Date(this.kpis.lastWorkoutDate).getTime();
    return Math.floor(diff / 86400000);
  }

  isInactive(): boolean {
    return this.inactiveDays() >= 5;
  }
}
