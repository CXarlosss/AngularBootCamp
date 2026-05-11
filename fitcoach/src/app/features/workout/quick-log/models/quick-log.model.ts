export interface QuickLogState {
  exerciseId: string;
  lastWeight: number;
  lastReps: number;
  lastSetIndex: number;
  timestamp: number;
}

export interface SetInputConfig {
  exerciseName: string;
  exerciseId: string;
  targetWeight: number;
  targetReps: number;
  setIndex: number;
  totalSets: number;
  previousSets: { weight: number; reps: number }[];
}

export interface ValidationResult {
  valid: boolean;
  warning?: string;
  severity: 'info' | 'warning' | 'error';
}

export interface XpPreview {
  setXp: number;
  sessionTotal: number;
  rankProgress: {
    currentDivision: string;
    percentToNext: number;
    xpToNextDivision: number;
  };
}
