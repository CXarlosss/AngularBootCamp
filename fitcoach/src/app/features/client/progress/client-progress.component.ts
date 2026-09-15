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
import { RouterModule } from '@angular/router';

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
    FcButtonDirective,
    RouterModule
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
  prAlert       = signal<PRAlert | null>(null);

  readonly Infinity = Infinity;

  prCount = computed(() => {
    const exercises = this.store.exercises();
    return exercises.filter(ex => ex.dataPoints && ex.dataPoints.length > 0).length;
  });

  recentPrs = computed(() => {
    const exercises = this.store.exercises();
    const list = exercises
      .map(ex => {
        const max = ex.dataPoints && ex.dataPoints.length ? Math.max(...ex.dataPoints.map(p => p.maxWeight)) : 0;
        return { name: ex.name, max };
      })
      .filter(ex => isFinite(ex.max) && ex.max > 0)
      .sort((a, b) => b.max - a.max)
      .slice(0, 3);
    return list;
  });

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
    this.detectNearPR();
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

  async detectNearPR() {
    const exercises = this.store.exercises();
    if (!exercises.length) return;

    let bestCandidate: PRAlert | null = null;
    let bestProgress = 0;

    for (const ex of exercises) {
      if (!ex.dataPoints || ex.dataPoints.length < 3) continue;

      const recent = ex.dataPoints.slice(-4);
      const weights = recent.map((h: any) => h.maxWeight || h.weight);
      if (weights.length < 2) continue;

      const trend = weights[weights.length - 1] - weights[0];
      const maxHistorical = Math.max(...ex.dataPoints.map((h: any) => h.maxWeight || h.weight));
      const current = weights[weights.length - 1];
      const gapToPR = maxHistorical - current;

      if (trend > 0 && gapToPR <= 2.5 && gapToPR > 0) {
        if (trend > bestProgress) {
          bestProgress = trend;
          bestCandidate = {
            exercise: ex.name,
            message: `A ${gapToPR.toFixed(1)}kg de tu récord (${maxHistorical}kg)`,
            route: '/client/progress'
          };
        }
      }
    }

    this.prAlert.set(bestCandidate);
  }

  getTrendForEntry(entries: any[], index: number): 'up' | 'down' | 'neutral' {
    if (index === 0) return 'neutral';
    const current = entries[index].maxWeight;
    const previous = entries[index - 1].maxWeight;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  }
}

interface PRAlert {
  exercise: string;
  message: string;
  route: string;
}
