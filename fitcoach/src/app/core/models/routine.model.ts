export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  targetWeight?: number;
  restSeconds: number;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  dayNumber: number;       // 1=Lunes … 7=Domingo
  label: string;           // "Pecho y tríceps"
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  goal: 'strength' | 'hypertrophy' | 'weight_loss' | 'mobility';
  coachId: string;
  days: RoutineDay[];
  isTemplate: boolean;
  createdAt: Date;
}

export interface AssignedRoutine {
  id: string;
  clientId: string;
  routineId: string;
  routine?: Routine;       // join en la query
  startDate: Date;
  status: 'active' | 'completed' | 'paused';
}
