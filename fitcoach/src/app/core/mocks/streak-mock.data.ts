import { CurrentWeekProgress, StreakState, WeeklyCompliance } from '../models/streak.model';

const CLIENT_ID = 'mock-client-001';

function isoWeek(offsetWeeks: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetWeeks * 7);
  const year = now.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function buildHistory(pattern: number[], plannedPerWeek = 4): WeeklyCompliance[] {
  return pattern.map((completed, i) => {
    const offset = -(pattern.length - i);
    const isCompliant = completed / plannedPerWeek >= 0.8;
    return {
      weekId: isoWeek(offset),
      clientId: CLIENT_ID,
      weekType: 'normal',
      plannedSessions: plannedPerWeek,
      completedSessions: completed,
      complianceThreshold: 0.8,
      isCompliant,
      completedAt: isCompliant ? new Date() : null
    };
  });
}

export const MOCK_STREAK_ACTIVE: { state: StreakState; history: WeeklyCompliance[]; currentWeek: CurrentWeekProgress } = {
  state: {
    clientId: CLIENT_ID,
    currentStreak: 6,
    longestStreak: 6,
    lastComplianceWeekId: isoWeek(-1),
    streakStartDate: new Date(Date.now() - 6 * 7 * 86400000),
    freezesAvailable: 1,
    freezesUsedHistory: [],
    status: 'active'
  },
  history: buildHistory([4, 4, 3, 4, 4, 4]),
  currentWeek: {
    weekId: isoWeek(0),
    plannedSessions: 4,
    completedSessions: 2,
    remainingSessions: 2,
    daysRemainingInWeek: 4,
    isCompliant: false
  }
};

export const MOCK_STREAK_AT_RISK: { state: StreakState; history: WeeklyCompliance[]; currentWeek: CurrentWeekProgress } = {
  state: {
    clientId: CLIENT_ID,
    currentStreak: 3,
    longestStreak: 6,
    lastComplianceWeekId: isoWeek(-1),
    streakStartDate: new Date(Date.now() - 3 * 7 * 86400000),
    freezesAvailable: 0,
    freezesUsedHistory: [],
    status: 'at-risk'
  },
  history: buildHistory([4, 3, 4]),
  currentWeek: {
    weekId: isoWeek(0),
    plannedSessions: 4,
    completedSessions: 1,
    remainingSessions: 3,
    daysRemainingInWeek: 2,
    isCompliant: false
  }
};

export const MOCK_STREAK_BROKEN: { state: StreakState; history: WeeklyCompliance[]; currentWeek: CurrentWeekProgress } = {
  state: {
    clientId: CLIENT_ID,
    currentStreak: 0,
    longestStreak: 6,
    lastComplianceWeekId: isoWeek(-2),
    streakStartDate: null,
    freezesAvailable: 1,
    freezesUsedHistory: [],
    status: 'broken'
  },
  history: buildHistory([4, 4, 1, 0]),
  currentWeek: {
    weekId: isoWeek(0),
    plannedSessions: 4,
    completedSessions: 0,
    remainingSessions: 4,
    daysRemainingInWeek: 6,
    isCompliant: false
  }
};

export const MOCK_STREAK_NEAR_MILESTONE: { state: StreakState; history: WeeklyCompliance[]; currentWeek: CurrentWeekProgress } = {
  state: {
    clientId: CLIENT_ID,
    currentStreak: 3,
    longestStreak: 3,
    lastComplianceWeekId: isoWeek(-1),
    streakStartDate: new Date(Date.now() - 3 * 7 * 86400000),
    freezesAvailable: 0,
    freezesUsedHistory: [],
    status: 'active'
  },
  history: buildHistory([4, 4, 4]),
  currentWeek: {
    weekId: isoWeek(0),
    plannedSessions: 4,
    completedSessions: 4,
    remainingSessions: 0,
    daysRemainingInWeek: 2,
    isCompliant: true
  }
};

export const STREAK_MOCK_SCENARIOS = {
  active: MOCK_STREAK_ACTIVE,
  atRisk: MOCK_STREAK_AT_RISK,
  broken: MOCK_STREAK_BROKEN,
  nearMilestone: MOCK_STREAK_NEAR_MILESTONE
};
