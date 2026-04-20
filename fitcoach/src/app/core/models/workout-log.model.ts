export interface SetLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  repsDone: number;
}

export interface WorkoutLog {
  id: string;
  clientId: string;
  assignedRoutineId: string;
  loggedDate: Date;
  completed: boolean;
  sets: SetLog[];
}
