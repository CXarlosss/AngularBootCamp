import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Task, TaskFilters, TaskStatus } from '../../../core/models/task.model';
import { TasksService } from './tasks.service';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  selectedTaskId: string | null;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
  },
  selectedTaskId: null,
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks, filters, selectedTaskId }) => ({
    completedCount: computed(() =>
      tasks().filter(t => t.status === 'done').length
    ),
    pendingCount: computed(() =>
      tasks().filter(t => t.status !== 'done').length
    ),
    selectedTask: computed(() =>
      tasks().find(t => t.id === selectedTaskId()) ?? null
    ),
    filteredTasks: computed(() => {
      const allTasks = tasks();
      const { search, status, priority, assigneeId } = filters();

      return allTasks.filter(task => {
        const matchSearch = search
          ? task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase())
          : true;

        const matchStatus = status !== 'all'
          ? task.status === status
          : true;

        const matchPriority = priority !== 'all'
          ? task.priority === priority
          : true;

        const matchAssignee = assigneeId !== 'all'
          ? task.assigneeId === assigneeId
          : true;

        return matchSearch && matchStatus && matchPriority && matchAssignee;
      });
    }),
    tasksByStatus: computed(() => {
      const allTasks = tasks();
      return {
        todo: allTasks.filter(t => t.status === 'todo').length,
        'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
      } satisfies Record<TaskStatus, number>;
    }),
  })),
  withMethods((store, tasksService = inject(TasksService)) => ({
    loadTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          tasksService.getAll().pipe(
            tapResponse({
              next: (tasks) => patchState(store, { tasks, isLoading: false }),
              error: (err: Error) =>
                patchState(store, {
                  isLoading: false,
                  error: err.message ?? 'Error al cargar tareas',
                }),
            })
          )
        )
      )
    ),
    toggleTaskStatus(taskId: string): void {
      const task = store.tasks().find(t => t.id === taskId);
      if (!task) return;

      const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';

      patchState(store, {
        tasks: store.tasks().map(t =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      });

      tasksService.update({ id: taskId, status: newStatus }).subscribe({
        error: () => {
          patchState(store, {
            tasks: store.tasks().map(t =>
              t.id === taskId ? { ...t, status: task.status } : t
            ),
          });
        },
      });
    },
    updateFilters(partial: Partial<TaskFilters>): void {
      patchState(store, state => ({
        filters: { ...state.filters, ...partial },
      }));
    },
    resetFilters(): void {
      patchState(store, { filters: initialState.filters });
    },
    selectTask(id: string | null): void {
      patchState(store, { selectedTaskId: id });
    },
  }))
);
