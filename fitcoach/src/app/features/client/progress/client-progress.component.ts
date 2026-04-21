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
        <p class="progress-sub">Rendimiento, adherencia y registros</p>
      </header>

      <div class="progress-content">
        <!-- ── KPI grid ── -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon adh"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg></div>
            <div class="kpi-info">
              <div class="kpi-label">Adherencia</div>
              <div class="kpi-value positive">{{ progressStore.adherencePct() }}%</div>
            </div>
            <div class="kpi-delta">↑ esta semana</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon record"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c0-.55.45-1 1-1h2.5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H6.5c-.55 0-1 .45-1 1v2.66c0 .55.45 1 1 1H9c.55 0 1 .45 1 1z"/></svg></div>
            <div class="kpi-info">
              <div class="kpi-label">Récord Max</div>
              <div class="kpi-value">{{ progressStore.maxWeight() }}kg</div>
            </div>
            <div class="kpi-delta-neutral">peso máximo</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon gain"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg></div>
            <div class="kpi-info">
              <div class="kpi-label">Mejora</div>
              <div class="kpi-value positive">+{{ progressStore.improvement() }}kg</div>
            </div>
            <div class="kpi-delta">vs inicio</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon sess"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M2 12h20M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10-10-4.48-10-10z"/></svg></div>
            <div class="kpi-info">
              <div class="kpi-label">Sesiones</div>
              <div class="kpi-value">{{ progressStore.totalSessions() }}</div>
            </div>
            <div class="kpi-delta-neutral">completadas</div>
          </div>
        </div>

        <!-- ── Ejercicios & Gráfica ── -->
        <div class="section-group">
          <div class="section-header-row">
            <span class="section-title">Análisis de Ejercicio</span>
            <div class="metric-toggle">
              <button [class.active]="metric() === 'maxWeight'" (click)="metric.set('maxWeight')">PR</button>
              <button [class.active]="metric() === 'totalVol'" (click)="metric.set('totalVol')">Vol</button>
            </div>
          </div>

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
                <span>Selecciona o completa un ejercicio</span>
              </div>
            }
          </div>
        </div>

        <!-- ── Adherencia semanal ── -->
        <div class="adherence-section">
          <div class="section-header">
            <span class="section-title">Consistencia últimas 8 semanas</span>
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
              Añadir
            </label>
            <input id="photo-upload" type="file" accept="image/*" style="display:none" (change)="onPhotoUpload($event)"/>
          </div>
          <div class="photos-grid">
            @if (progressStore.photos().length === 0) {
              <div class="photos-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
                <span>Sin fotos aún</span>
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

      <nav class="bottom-nav">
        <button class="nav-btn" (click)="router.navigate(['/client/dashboard'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Inicio</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/workout'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4"/></svg>
          <span>Entreno</span>
        </button>
        <button class="nav-btn active" (click)="router.navigate(['/client/progress'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>Progreso</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/chat'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Chat</span>
        </button>
      </nav>

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
