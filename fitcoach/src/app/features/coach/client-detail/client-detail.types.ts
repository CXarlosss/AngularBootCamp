export interface ClientDetail {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  activeRoutine: string | null;
  lastActive: Date | null;
}

export interface ClientKPIs {
  adherencePercent: number;
  adherenceDelta: number;
  daysCompleted: number;
  daysTotal: number;
  currentWeight: number | null;
  weightDelta: number | null;
  currentStreak: number;
}

export interface WeekDay {
  label: string;
  status: 'done' | 'missed' | 'pending';
}

export interface ExerciseProgress {
  name: string;
  bestWeight: number | null;
  bestReps: number;
  delta: number;
  daysAgo: number;
}
