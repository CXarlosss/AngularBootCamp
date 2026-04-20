import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'ff-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card">
      <h3>{{ task.title }}</h3>
      <p>{{ task.notes }}</p>
      <button (click)="complete.emit()">Completar</button>
      <button (click)="focus.emit()">Focus</button>
    </div>
  `
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() complete = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
}
