import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../../core/services/streak.service';

@Component({
  selector: 'app-streak-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streak-widget.component.html',
  styleUrl: './streak-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreakWidgetComponent {
  private readonly streakService = inject(StreakService);

  readonly currentStreak = this.streakService.currentStreak;
  readonly status = this.streakService.streakStatus;
  readonly freezesAvailable = this.streakService.freezesAvailable;
  readonly nextMilestone = this.streakService.nextMilestone;
  readonly progressToMilestone = this.streakService.progressToNextMilestone;
  readonly currentWeek = this.streakService.currentWeekProgress;

  readonly weekSlots = computed(() => {
    const week = this.currentWeek();
    if (!week) return [];

    return Array.from({ length: week.plannedSessions }, (_, i) => ({
      filled: i < week.completedSessions
    }));
  });

  readonly headline = computed(() => {
    switch (this.status()) {
      case 'active':
        return `Llevas ${this.currentStreak()} semanas seguidas`;
      case 'at-risk':
        return 'Tu racha está en riesgo';
      case 'broken':
        return this.currentStreak() === 0 ? 'Nueva racha, arranca hoy' : 'Racha reiniciada';
    }
  });

  readonly subtext = computed(() => {
    const week = this.currentWeek();
    if (!week) return '';

    switch (this.status()) {
      case 'active':
        return week.isCompliant
          ? 'Semana completada. ¡Sigue así!'
          : `${week.remainingSessions} sesiones más para asegurar esta semana`;
      case 'at-risk':
        return `Te faltan ${week.remainingSessions} sesiones y quedan ${week.daysRemainingInWeek} días`;
      case 'broken':
        return 'Cada semana es una nueva oportunidad';
    }
  });
}
