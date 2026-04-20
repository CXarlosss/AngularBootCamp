import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressStore } from '../../../state/progress.store';
import { ProgressChartComponent } from '../../../shared/components/progress-chart/progress-chart.component';
import { supabase } from '../../../core/supabase.client';

@Component({
  selector: 'fc-client-detail',
  standalone: true,
  imports: [CommonModule, ProgressChartComponent],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button class="btn-back" (click)="router.navigate(['/coach/dashboard'])">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="client-info">
          <h1>{{ clientName() }}</h1>
          <p class="status-badge" [class.active]="true">Cliente Activo</p>
        </div>
      </header>

      <!-- ── KPI grid ── -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Adherencia</div>
          <div class="kpi-value positive">{{ progressStore.adherencePct() }}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Récord Actual</div>
          <div class="kpi-value">{{ progressStore.maxWeight() }}kg</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mejora Total</div>
          <div class="kpi-value positive">+{{ progressStore.improvement() }}kg</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sesiones</div>
          <div class="kpi-value">{{ progressStore.totalSessions() }}</div>
        </div>
      </div>

      <!-- ── Gráfica de Progreso Real (Chart.js) ── -->
      <section class="section-card">
        <div class="section-header">
          <h2>Evolución de Rendimiento</h2>
          <div class="chart-controls">
            <select (change)="onExerciseChange($event)" class="select-ex">
              @for (ex of progressStore.exercises(); track ex.name) {
                <option [value]="ex.name">{{ ex.name }}</option>
              }
            </select>
            <div class="metric-tabs">
              <button [class.active]="metric() === 'maxWeight'" (click)="metric.set('maxWeight')">Peso</button>
              <button [class.active]="metric() === 'totalVol'" (click)="metric.set('totalVol')">Volumen</button>
            </div>
          </div>
        </div>
        
        <div class="chart-height">
          @if (progressStore.selectedExercise()) {
            <fc-progress-chart 
              [exercise]="progressStore.selectedExercise()"
              [metric]="metric()"
            />
          } @else {
            <p class="empty-msg text-center">Este cliente aún no tiene datos de entrenamiento registrados.</p>
          }
        </div>
      </section>

      <!-- ── Fotos de Progreso ── -->
      <section class="section-card">
        <div class="section-header">
          <h2>Galería de Evolución</h2>
        </div>
        <div class="photos-grid">
          @if (progressStore.photos().length === 0) {
            <p class="empty-msg">No hay fotos de progreso disponibles.</p>
          }
          @for (photo of progressStore.photos(); track photo.id) {
            <div class="photo-card">
              <img [src]="photo.url" />
              <div class="photo-overlay">
                <span>{{ photo.takenAt | date:'dd MMM yyyy' }}</span>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .detail-container { padding: 24px; max-width: 1100px; margin: 0 auto; color: white; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .btn-back { background: rgba(255,255,255,0.05); border: none; color: white; padding: 12px; border-radius: 14px; cursor: pointer; transition: 0.2s; }
    .btn-back:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }
    .client-info h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .status-badge { background: #1D9E75; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .kpi-card { background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(255,255,255,0.06); padding: 24px; border-radius: 20px; transition: 0.3s; }
    .kpi-card:hover { transform: translateY(-4px); border-color: rgba(29, 158, 117, 0.3); }
    .kpi-label { color: #888; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .kpi-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .positive { color: #1D9E75; }

    .section-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 28px; border-radius: 24px; margin-bottom: 32px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h2 { margin: 0; font-size: 20px; font-weight: 700; }
    
    .chart-controls { display: flex; gap: 12px; align-items: center; }
    .select-ex { background: #1a1a1a; color: white; border: 1px solid #333; padding: 10px 16px; border-radius: 12px; font-size: 14px; outline: none; transition: 0.2s; min-width: 180px; }
    .select-ex:focus { border-color: #1D9E75; }

    .metric-tabs { display: flex; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 10px; }
    .metric-tabs button { background: none; border: none; color: #888; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .metric-tabs button.active { background: #1D9E75; color: white; box-shadow: 0 4px 12px rgba(29, 158, 117, 0.3); }

    .chart-height { height: 320px; width: 100%; position: relative; }

    .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
    .photo-card { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; cursor: pointer; }
    .photo-card:hover { transform: scale(1.03); border-color: #1D9E75; }
    .photo-card img { width: 100%; aspect-ratio: 4/5; object-fit: cover; }
    .photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; font-size: 11px; text-align: center; }
    
    .empty-msg { color: #666; font-style: italic; width: 100%; }
    .text-center { text-align: center; }
  `]
})
export class ClientDetailComponent implements OnInit {
  progressStore = inject(ProgressStore);
  route         = inject(ActivatedRoute);
  router        = inject(Router);
  
  clientName = signal('Cargando...');
  metric = signal<'maxWeight' | 'totalVol'>('maxWeight');

  async ngOnInit() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId) {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', clientId).single();
      if (data) {
        this.clientName.set(data.full_name);
        await this.progressStore.load(clientId);
      } else {
        // Si el cliente no existe, volvemos
        this.router.navigate(['/coach/dashboard']);
      }
    } else {
      this.router.navigate(['/coach/dashboard']);
    }
  }

  onExerciseChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.progressStore.selectExercise(val);
  }
}
