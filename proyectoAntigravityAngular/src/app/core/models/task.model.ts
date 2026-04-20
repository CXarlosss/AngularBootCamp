export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdAt: string; // ISO 8601 — lo que devuelve una API REST real
  updatedAt: string;
  dueDate: string | null;
  tags: string[];
}

// DTO para crear: el backend genera id, createdAt, updatedAt
export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// DTO para actualizar: todo opcional excepto el id
export type UpdateTaskDto = Partial<Omit<Task, 'id' | 'createdAt'>> & { id: string };

// Para los filtros del UI
export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assigneeId: string | 'all';
}
