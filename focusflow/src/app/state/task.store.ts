import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { Task, EnergyLevel, ENERGY_WEIGHTS } from '../core/models/task.model';
import { TaskRepository } from '../core/repositories/task.repository';
import { AiService } from '../core/services/ai.service';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  currentEnergy: EnergyLevel;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  currentEnergy: 'medium',
  error: null,
};

export const TaskStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ tasks, currentEnergy }) => ({
    todayTasks: computed(() =>
      tasks()
        .filter(t => t.status === 'today' || t.status === 'in_progress')
        .map(t => ({ ...t, score: scoreTask(t, currentEnergy()) }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    ),
    topTask: computed(() => {
      const today = tasks()
        .filter(t => t.status === 'today' || t.status === 'in_progress')
        .map(t => ({ ...t, score: scoreTask(t, currentEnergy()) }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      return today[0] ?? null;
    }),
    inboxTasks: computed(() =>
      tasks().filter(t => t.status === 'inbox')
    ),
    completedToday: computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return tasks().filter(t =>
        t.status === 'done' &&
        t.completedAt &&
        new Date(t.completedAt) >= today
      ).length;
    }),
  })),

  withMethods((store, repo = inject(TaskRepository), ai = inject(AiService)) => ({
    async loadTasks(userId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const tasks = await repo.getAll(userId);
        patchState(store, { tasks, loading: false });
      } catch (e) {
        patchState(store, { loading: false, error: 'Error cargando tareas' });
      }
    },
    async addTask(dto: Parameters<TaskRepository['create']>[0], userId: string): Promise<void> {
      const task = await repo.create(dto, userId);
      patchState(store, { tasks: [...store.tasks(), task] });
    },
    async completeTask(id: string): Promise<void> {
      await repo.update(id, { status: 'done', completedAt: new Date() });
      patchState(store, {
        tasks: store.tasks().map(t =>
          t.id === id ? { ...t, status: 'done' as const, completedAt: new Date() } : t
        ),
      });
    },
    setEnergy(level: EnergyLevel): void {
      patchState(store, { currentEnergy: level });
    },
  }))
);

function scoreTask(task: Task, userEnergy: EnergyLevel): number {
  const energyMatch = calcEnergyMatch(task.context.energyRequired, userEnergy);
  const urgency     = calcUrgency(task.deadline);
  const recency     = calcRecency(task.createdAt);
  return Math.round(energyMatch * 0.4 + urgency * 0.4 + recency * 0.2);
}

function calcEnergyMatch(required: EnergyLevel, current: EnergyLevel): number {
  const levels: EnergyLevel[] = ['low', 'medium', 'high'];
  const diff = Math.abs(levels.indexOf(required) - levels.indexOf(current));
  return diff === 0 ? 100 : diff === 1 ? 60 : 20;
}

function calcUrgency(deadline?: Date): number {
  if (!deadline) return 30;
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 36e5;
  if (hoursLeft <= 0)   return 100;
  if (hoursLeft <= 2)   return 95;
  if (hoursLeft <= 8)   return 80;
  if (hoursLeft <= 24)  return 65;
  if (hoursLeft <= 72)  return 45;
  return 25;
}

function calcRecency(createdAt: Date): number {
  const daysOld = (Date.now() - new Date(createdAt).getTime()) / 864e5;
  return Math.max(0, 100 - daysOld * 5);
}
