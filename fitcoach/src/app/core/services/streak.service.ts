import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  CurrentWeekProgress,
  StreakFreeze,
  StreakState,
  StreakStatus,
  WeeklyCompliance,
  STREAK_MILESTONES,
  StreakMilestone,
  StreakMilestoneEvent
} from '../models/streak.model';
import { FRAME_CELEBRATION_SERVICE } from './frame-celebration.contract';

@Injectable({ providedIn: 'root' })
export class StreakService {
  private readonly frameCelebration = inject(FRAME_CELEBRATION_SERVICE, { optional: true });

  private readonly _streakState = signal<StreakState | null>(null);
  private readonly _weeklyHistory = signal<WeeklyCompliance[]>([]);
  private readonly _currentWeekProgress = signal<CurrentWeekProgress | null>(null);

  readonly streakState = this._streakState.asReadonly();
  readonly weeklyHistory = this._weeklyHistory.asReadonly();
  readonly currentWeekProgress = this._currentWeekProgress.asReadonly();

  readonly currentStreak = computed(() => this._streakState()?.currentStreak ?? 0);
  readonly longestStreak = computed(() => this._streakState()?.longestStreak ?? 0);
  readonly freezesAvailable = computed(() => this._streakState()?.freezesAvailable ?? 0);

  readonly streakStatus = computed<StreakStatus>(() => {
    const state = this._streakState();
    const week = this._currentWeekProgress();
    if (!state) return 'broken';
    if (!week) return state.status;

    if (week.isCompliant) return 'active';
    if (week.daysRemainingInWeek <= 2 && !week.isCompliant) return 'at-risk';
    return state.status === 'broken' ? 'broken' : 'active';
  });

  readonly nextMilestone = computed<StreakMilestone | null>(() => {
    const streak = this.currentStreak();
    return STREAK_MILESTONES.find(m => m > streak) ?? null;
  });

  readonly progressToNextMilestone = computed(() => {
    const streak = this.currentStreak();
    const next = this.nextMilestone();
    if (!next) return 1;
    const prevMilestone = [...STREAK_MILESTONES].reverse().find(m => m < next) ?? 0;
    return (streak - prevMilestone) / (next - prevMilestone);
  });

  constructor() {
    effect(() => {
      const streak = this.currentStreak();
      const state = this._streakState();
      if (!state) return;

      if ((STREAK_MILESTONES as readonly number[]).includes(streak) && streak > 0) {
        const event: StreakMilestoneEvent = {
          type: 'streak-milestone',
          clientId: state.clientId,
          value: streak as StreakMilestone,
          unlockedFrameId: `streak-${streak as StreakMilestone}w`
        };
        this.frameCelebration?.celebrate(event);
      }
    });
  }

  loadStreakData(state: StreakState, history: WeeklyCompliance[], currentWeek: CurrentWeekProgress): void {
    this._streakState.set(state);
    this._weeklyHistory.set(history);
    this._currentWeekProgress.set(currentWeek);
  }

  registerSessionCompleted(): void {
    const week = this._currentWeekProgress();
    if (!week) return;

    const completed = week.completedSessions + 1;
    const isCompliant = completed / week.plannedSessions >= 0.8;

    this._currentWeekProgress.set({
      ...week,
      completedSessions: completed,
      remainingSessions: Math.max(0, week.plannedSessions - completed),
      isCompliant
    });

    if (isCompliant) {
      this.closeCurrentWeekAsCompliant();
    }
  }

  private closeCurrentWeekAsCompliant(): void {
    const state = this._streakState();
    const week = this._currentWeekProgress();
    if (!state || !week) return;

    this._streakState.set({
      ...state,
      currentStreak: state.currentStreak + 1,
      longestStreak: Math.max(state.longestStreak, state.currentStreak + 1),
      lastComplianceWeekId: week.weekId,
      streakStartDate: state.streakStartDate ?? new Date(),
      status: 'active'
    });
  }

  applyFreeze(): boolean {
    const state = this._streakState();
    if (!state || state.freezesAvailable <= 0) return false;

    const freeze: StreakFreeze = {
      id: crypto.randomUUID(),
      clientId: state.clientId,
      earnedFrom: 'milestone',
      usedOnWeekId: this._currentWeekProgress()?.weekId ?? null,
      earnedAt: new Date(),
      expiresAt: null
    };

    this._streakState.set({
      ...state,
      freezesAvailable: state.freezesAvailable - 1,
      freezesUsedHistory: [...state.freezesUsedHistory, freeze]
    });
    return true;
  }

  breakStreak(): void {
    const state = this._streakState();
    if (!state) return;
    this._streakState.set({
      ...state,
      currentStreak: 0,
      streakStartDate: null,
      status: 'broken'
    });
  }
}
