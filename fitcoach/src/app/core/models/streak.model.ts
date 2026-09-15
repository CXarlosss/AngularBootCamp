export type StreakStatus = 'active' | 'at-risk' | 'broken';
export type WeekType = 'normal' | 'deload' | 'vacation';

export interface WeeklyCompliance {
  weekId: string;
  clientId: string;
  weekType: WeekType;
  plannedSessions: number;
  completedSessions: number;
  complianceThreshold: number;
  isCompliant: boolean;
  completedAt: Date | null;
}

export interface StreakState {
  clientId: string;
  currentStreak: number;
  longestStreak: number;
  lastComplianceWeekId: string | null;
  streakStartDate: Date | null;
  freezesAvailable: number;
  freezesUsedHistory: StreakFreeze[];
  status: StreakStatus;
}

export interface StreakFreeze {
  id: string;
  clientId: string;
  earnedFrom: 'milestone' | 'coach-granted' | 'purchased';
  usedOnWeekId: string | null;
  earnedAt: Date;
  expiresAt: Date | null;
}

export interface CurrentWeekProgress {
  weekId: string;
  plannedSessions: number;
  completedSessions: number;
  remainingSessions: number;
  daysRemainingInWeek: number;
  isCompliant: boolean;
}

export const STREAK_MILESTONES = [4, 8, 12, 26, 52] as const;
export type StreakMilestone = typeof STREAK_MILESTONES[number];

export interface StreakMilestoneEvent {
  type: 'streak-milestone';
  clientId: string;
  value: StreakMilestone;
  unlockedFrameId: `streak-${StreakMilestone}w`;
}
