import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-card" [class]="'priority-' + task().priority">
      <div class="task-header">
        <h3>{{ task().title }}</h3>
        <span class="status-badge status-{{ task().status }}">
          {{ task().status }}
        </span>
      </div>

      <p class="task-description">{{ task().description }}</p>

      <div class="task-footer">
        <span class="priority-label">{{ task().priority }}</span>
        <button (click)="toggleStatus.emit(task().id)">
          {{ task().status === 'done' ? 'Reabrir' : 'Completar' }}
        </button>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  readonly toggleStatus = output<string>();
}
