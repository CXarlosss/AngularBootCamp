import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProgressStore } from '../../../state/progress.store';
import { AuthService }   from '../../../core/auth/auth.service';
import { ProgressChartComponent } from '../../../shared/components/progress-chart/progress-chart.component';

@Component({
  selector: 'fc-client-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProgressChartComponent],
  template: `
    <div class="progress-screen">
      <header class="progress-header">
        <h1 class="progress-title">Tu Evolución</h1>
        <p class="progress-sub">Seguimiento de rendimiento y adherencia</p>
      </header>

      <!-- ── KPI grid ── -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Adherencia media</div>
          <div class="kpi-value positive">{{ progressStore.adherencePct() }}%</div>
          <div class="kpi-delta">↑ esta semana</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Récord actual</div>
          <div class="kpi-value">{{ progressStore.maxWeight() }}kg</div>
          <div class="kpi-delta-neutral">peso máximo</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mejora total</div>
          <div class="kpi-value positive">+{{ progressStore.improvement() }}kg</div>
          <div class="kpi-delta">vs inicio</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sesiones</div>
          <div class="kpi-value">{{ progressStore.totalSessions() }}</div>
          <div class="kpi-delta-neutral">completadas</div>
        </div>
      </div>

      <!-- ── Selector de ejercicio ── -->
      <div class="exercise-selector">
        @for (ex of progressStore.exercises(); track ex.name) {
          <button
            class="ex-pill"
            [class.active]="progressStore.selected() === ex.name"
            (click)="progressStore.selectExercise(ex.name)"
          >
            {{ ex.name }}
          </button>
        }
      </div>

      <!-- ── Toggle métrica ── -->
      <div class="metric-toggle">
        <button
          [class.active]="metric() === 'maxWeight'"
          (click)="metric.set('maxWeight')"
        >Peso máximo</button>
        <button
          [class.active]="metric() === 'totalVol'"
          (click)="metric.set('totalVol')"
        >Volumen total</button>
      </div>

      <!-- ── Gráfica Real (Chart.js) ── -->
      <div class="chart-container">
        @if (progressStore.selectedExercise()) {
          <div class="chart-wrap">
            <fc-progress-chart
              [exercise]="progressStore.selectedExercise()"
              [metric]="metric()"
            />
          </div>
        } @else {
          <div class="chart-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            <span>Completa entrenamientos para ver tu progreso</span>
          </div>
        }
      </div>

      <!-- ── Barras de adherencia semanal ── -->
      <div class="adherence-section">
        <div class="section-header">
          <span class="section-title">Adherencia — últimas 8 semanas</span>
        </div>
        <div class="adherence-bars">
          @for (week of progressStore.adherenceWeeks(); track week.label) {
            <div class="adh-bar-wrap">
              <div class="adh-bar">
                <div
                  class="adh-fill"
                  [class.high]="week.pct >= 80"
                  [class.mid]="week.pct >= 40 && week.pct < 80"
                  [class.low]="week.pct > 0 && week.pct < 40"
                  [class.zero]="week.pct === 0"
                  [style.height.%]="week.pct || 8"
                ></div>
              </div>
              <span class="adh-label">{{ week.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- ── Fotos de progreso ── -->
      <div class="photos-section">
        <div class="photos-header">
          <span class="section-title">Fotos de progreso</span>
          <label class="upload-btn" for="photo-upload">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Añadir foto
          </label>
          <input id="photo-upload" type="file" accept="image/*" style="display:none" (change)="onPhotoUpload($event)"/>
        </div>
        <div class="photos-grid">
          @if (progressStore.photos().length === 0) {
            <div class="photos-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
              </svg>
              <span>Sube tu primera foto para comparar tu evolución</span>
            </div>
          }
          @for (photo of progressStore.photos(); track photo.id) {
            <div class="photo-thumb">
              <img [src]="photo.url" [alt]="photo.takenAt | date:'dd MMM'"/>
              <div class="photo-date">{{ photo.takenAt | date:'dd MMM' }}</div>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styleUrl: './client-progress.component.css'
})
export class ClientProgressComponent implements OnInit {
  progressStore = inject(ProgressStore);
  auth          = inject(AuthService);
  router        = inject(Router);
  metric        = signal<'maxWeight' | 'totalVol'>('maxWeight');

  async ngOnInit(): Promise<void> {
    const id = this.auth.profile()?.id;
    if (id) await this.progressStore.load(id);
  }

  async onPhotoUpload(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    const id   = this.auth.profile()?.id;
    if (file && id) await this.progressStore.uploadPhoto(id, file);
  }
}
