export type EnergyLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'inbox' | 'today' | 'in_progress' | 'done' | 'archived';

export interface TaskContext {
  energyRequired: EnergyLevel;
  estimatedMinutes: number;
  tags: string[];
  projectId?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  context: TaskContext;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId: string;
  synced: boolean;
  score?: number;
}

export interface TaskCreateDto {
  title: string;
  notes?: string;
  context: Partial<TaskContext>;
  deadline?: Date;
}
