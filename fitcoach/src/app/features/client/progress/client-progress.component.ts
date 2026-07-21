import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProgressService, ProgressStats } from '../../../core/services/progress.service';
import { WeightLogService, WeightEntry } from './weight-bottom-sheet/weight-log.service';
import { WeightBottomSheetComponent } from './weight-bottom-sheet/weight-bottom-sheet.component';
import { WeightChartComponent } from '../../../shared/components/weight-chart/weight-chart.component';
import { ProgressStore } from '../../../state/progress.store';
import { ProgressChartComponent } from '../../../shared/components/progress-chart/progress-chart.component';
import { AuthService } from '../../../core/auth/auth.service';
import { FcCardComponent, FcCardActionsDirective } from '../../../shared/components/card/fc-card.component';
import { FcButtonDirective } from '../../../shared/components/button/fc-button.directive';

@Component({
  selector: 'fc-client-progress',
  standalone: true,
  imports: [
    CommonModule, 
    DecimalPipe, 
    WeightBottomSheetComponent, 
    WeightChartComponent,
    ProgressChartComponent,
    FcCardComponent,
    FcCardActionsDirective,
    FcButtonDirective
  ],
  templateUrl: './client-progress.component.html',
  styleUrl: './client-progress.component.css'
})
export class ClientProgressComponent implements OnInit {
  private progressSvc = inject(ProgressService);
  private weightSvc   = inject(WeightLogService);
  private auth        = inject(AuthService);
  readonly store      = inject(ProgressStore);

  stats         = signal<ProgressStats | null>(null);
  weightHistory = signal<WeightEntry[]>([]);
  lastWeight    = signal<number | null>(null);
  weightDelta   = signal<number | null>(null);
  daysAgo       = signal<number>(Infinity);
  sheetOpen     = signal(false);
  loading       = signal(true);

  readonly Infinity = Infinity;

  async ngOnInit() {
    this.loading.set(true);
    const myId = this.auth.user()?.id;
    if (!myId) return;

    // Carga paralela
    const [stats, history, lastEntry] = await Promise.all([
      this.progressSvc.getStats(),
      this.weightSvc.getHistory(),
      this.weightSvc.getLastEntry(),
      this.store.load(myId) // Cargar también el store para ejercicios
    ]);

    this.stats.set(stats);
    this.weightHistory.set(history);

    if (lastEntry && lastEntry.weight_kg !== undefined) {
      this.lastWeight.set(lastEntry.weight_kg);
      this.daysAgo.set(this.weightSvc.daysSinceLastEntry(lastEntry));
      if (history.length >= 2) {
        const delta = history[history.length - 1].weight_kg - history[0].weight_kg;
        this.weightDelta.set(+delta.toFixed(1));
      }
    }

    this.loading.set(false);
  }

  async onWeightSaved(newWeight: number) {
    this.lastWeight.set(newWeight);
    this.daysAgo.set(0);
    this.sheetOpen.set(false);
    
    const [history, stats] = await Promise.all([
      this.weightSvc.getHistory(),
      this.progressSvc.getStats()
    ]);
    
    this.weightHistory.set(history);
    this.stats.set(stats);
    
    if (history.length >= 2) {
      const delta = history[history.length - 1].weight_kg - history[0].weight_kg;
      this.weightDelta.set(+delta.toFixed(1));
    }
  }

  onExerciseChange(name: string) {
    this.store.selectExercise(name);
    this.dropdownOpen.set(false);
  }

  dropdownOpen = signal(false);

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }
}
