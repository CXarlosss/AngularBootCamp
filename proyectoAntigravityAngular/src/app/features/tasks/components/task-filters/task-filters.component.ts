import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TaskFilters } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filters-bar">
      <input
        type="text"
        placeholder="Buscar tareas..."
        [value]="filters().search"
        (input)="onSearchChange($event)"
      />

      <select
        [value]="filters().status"
        (change)="onStatusChange($event)"
      >
        <option value="all">Todos los estados</option>
        <option value="todo">Por hacer</option>
        <option value="in-progress">En progreso</option>
        <option value="done">Completadas</option>
      </select>

      <select
        [value]="filters().priority"
        (change)="onPriorityChange($event)"
      >
        <option value="all">Todas las prioridades</option>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="critical">Crítica</option>
      </select>

      <button (click)="filtersChange.emit({ search: '', status: 'all', priority: 'all', assigneeId: 'all' })">
        Limpiar
      </button>
    </div>
  `,
})
export class TaskFiltersComponent {
  readonly filters = input.required<TaskFilters>();
  readonly filtersChange = output<Partial<TaskFilters>>();

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filtersChange.emit({ search: value });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TaskFilters['status'];
    this.filtersChange.emit({ status: value });
  }

  onPriorityChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TaskFilters['priority'];
    this.filtersChange.emit({ priority: value });
  }
}
