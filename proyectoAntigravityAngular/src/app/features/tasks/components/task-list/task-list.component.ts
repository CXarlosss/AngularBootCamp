import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TasksStore } from '../../data-access/tasks.store';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFiltersComponent } from '../task-filters/task-filters.component';
import { TaskFilters } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCardComponent, TaskFiltersComponent],
  template: `
    <div class="task-list-container">
      <div class="stats-bar">
        <span>Total: {{ store.tasks().length }}</span>
        <span>Completadas: {{ store.completedCount() }}</span>
        <span>Pendientes: {{ store.pendingCount() }}</span>
      </div>

      <app-task-filters
        [filters]="store.filters()"
        (filtersChange)="onFiltersChange($event)"
      />

      @if (store.isLoading()) {
        <div class="loading-state">Cargando tareas...</div>
      }

      @if (store.error()) {
        <div class="error-state">
          {{ store.error() }}
          <button (click)="store.loadTasks()">Reintentar</button>
        </div>
      }

      @if (!store.isLoading() && !store.error()) {
        @for (task of store.filteredTasks(); track task.id) {
          <app-task-card
            [task]="task"
            (toggleStatus)="store.toggleTaskStatus($event)"
          />
        } @empty {
          <div class="empty-state">
            No hay tareas que coincidan con los filtros.
          </div>
        }
      }
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  readonly store = inject(TasksStore);

  ngOnInit(): void {
    this.store.loadTasks();
  }

  onFiltersChange(filters: Partial<TaskFilters>): void {
    this.store.updateFilters(filters);
  }
}
