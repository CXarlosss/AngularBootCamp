import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressStore } from '../../../../../state/progress.store';
import { ProgressChartComponent } from '../../../../../shared/components/progress-chart/progress-chart.component';

@Component({
  selector: 'app-client-progress',
  standalone: true,
  imports: [CommonModule, ProgressChartComponent],
  template: `
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

    <!-- Historico de records -->
    <section class="section-card">
      <h3>Historial de Records</h3>
      <div class="records-list">
        @for (dp of progressStore.selectedExercise()?.dataPoints; track dp.date.getTime()) {
          <div class="record-row">
            <span class="date">{{ dp.date | date:'dd MMM yyyy' }}</span>
            <span class="val">{{ dp.maxWeight }}kg</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .section-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 24px; border-radius: 24px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    h2, h3 { margin: 0; font-size: 18px; font-weight: 700; color: white; }
    
    .chart-controls { display: flex; gap: 12px; align-items: center; }
    .select-ex { background: #1a1a1a; color: white; border: 1px solid #333; padding: 8px 12px; border-radius: 10px; font-size: 13px; outline: none; }

    .metric-tabs { display: flex; background: rgba(255,255,255,0.05); padding: 3px; border-radius: 8px; }
    .metric-tabs button { background: none; border: none; color: #888; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .metric-tabs button.active { background: #1D9E75; color: white; }

    .chart-height { height: 300px; width: 100%; position: relative; }
    
    .records-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .record-row { display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.01); border-radius: 8px; font-size: 14px; }
    .date { color: #888; }
    .val { font-weight: 700; color: #1D9E75; }

    .empty-msg { color: #666; font-style: italic; margin-top: 40px; }
    .text-center { text-align: center; }
  `]
})
export class ClientProgressComponent implements OnInit {
  @Input() clientId!: string;
  progressStore = inject(ProgressStore);
  metric = signal<'maxWeight' | 'totalVol'>('maxWeight');

  ngOnInit() {
    // Si no está cargado ya (o es otro cliente), lo cargamos
    // El componente padre ya debería haber llamado a load, pero por seguridad:
    if (this.clientId) {
       this.progressStore.load(this.clientId);
    }
  }

  onExerciseChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.progressStore.selectExercise(val);
  }
}
