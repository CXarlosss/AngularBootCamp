import {
  Component, input, output,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../../core/models/routine.model';

@Component({
  selector: 'fc-exercise-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styleUrl: './exercise-row.component.css',
  template: `
    <div class="exercise-row">

      <span class="ex-index">{{ index() + 1 }}</span>

      <div class="ex-name">{{ exercise().name }}</div>

      <!-- Series -->
      <div class="ex-field">
        <label>Series</label>
        <div class="stepper-sm">
          <button type="button" (click)="adjust('sets', -1)">−</button>
          <span>{{ exercise().sets }}</span>
          <button type="button" (click)="adjust('sets', 1)">+</button>
        </div>
      </div>

      <!-- Reps -->
      <div class="ex-field">
        <label>Reps</label>
        <div class="stepper-sm">
          <button type="button" (click)="adjust('reps', -1)">−</button>
          <span>{{ exercise().reps }}</span>
          <button type="button" (click)="adjust('reps', 1)">+</button>
        </div>
      </div>

      <!-- Peso objetivo -->
      <div class="ex-field">
        <label>Peso obj.</label>
        <input
          type="number"
          step="2.5"
          min="0"
          placeholder="—"
          class="weight-input"
          [ngModel]="exercise().targetWeight"
          (ngModelChange)="emit('targetWeight', +$event)"
        />
        <span class="unit">kg</span>
      </div>

      <!-- Descanso -->
      <div class="ex-field">
        <label>Descanso</label>
        <select
          [ngModel]="exercise().restSeconds"
          (ngModelChange)="emit('restSeconds', +$event)"
          class="rest-select"
        >
          <option [value]="30">30s</option>
          <option [value]="60">1 min</option>
          <option [value]="90">1:30</option>
          <option [value]="120">2 min</option>
          <option [value]="180">3 min</option>
        </select>
      </div>

      <!-- Notas -->
      <input
        type="text"
        placeholder="Nota para el cliente..."
        class="ex-notes"
        [ngModel]="exercise().notes"
        (ngModelChange)="emit('notes', $event)"
      />

      <button class="ex-remove" type="button" (click)="removed.emit()">×</button>
    </div>
  `,
})
export class ExerciseRowComponent {
  exercise = input.required<Exercise>();
  index    = input.required<number>();

  updated = output<Partial<Exercise>>();
  removed = output<void>();

  adjust(field: 'sets' | 'reps', delta: number): void {
    const current = this.exercise()[field];
    const min = field === 'sets' ? 1 : 1;
    this.updated.emit({ [field]: Math.max(min, current + delta) });
  }

  emit<K extends keyof Exercise>(field: K, value: Exercise[K]): void {
    this.updated.emit({ [field]: value });
  }
}
