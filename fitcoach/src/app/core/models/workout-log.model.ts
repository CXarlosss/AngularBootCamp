export interface SetLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  repsDone: number;
  completedAt: Date;
}

export interface WorkoutLog {
  id: string;
  clientId: string;
  assignedRoutineId: string;
  routineId: string;
  dayId: string;
  loggedDate: Date;
  completed: boolean;
  sets: SetLog[];
}
