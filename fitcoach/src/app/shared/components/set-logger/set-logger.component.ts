import { Component, input, output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetLog } from '../../../core/models/workout-log.model';

@Component({
  selector: 'fc-set-logger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="set-logger">
      <div class="set-header">
        <span class="set-num">Serie {{ setNumber() }}</span>
        @if (previousSet()) {
          <span class="prev-hint">
            Anterior: {{ previousSet()!.weightKg }}kg × {{ previousSet()!.repsDone }}
          </span>
        }
      </div>

      <div class="inputs-row">
        <div class="input-group">
          <label>Peso (kg)</label>
          <div class="stepper">
            <button type="button" (click)="adjustWeight(-2.5)">−</button>
            <input
              type="number"
              step="2.5"
              min="0"
              [ngModel]="weight()"
              (ngModelChange)="weight.set(+$event)"
            />
            <button type="button" (click)="adjustWeight(2.5)">+</button>
          </div>
        </div>

        <div class="input-group">
          <label>Reps</label>
          <div class="stepper">
            <button type="button" (click)="adjustReps(-1)">−</button>
            <input type="number" min="1" max="50" [ngModel]="reps()" (ngModelChange)="reps.set(+$event)" />
            <button type="button" (click)="adjustReps(1)">+</button>
          </div>
        </div>
      </div>

      <button
        class="log-btn"
        type="button"
        [disabled]="weight() <= 0 || reps() <= 0"
        (click)="onLog()"
      >
        Registrar serie
      </button>
    </div>
  `,
  styleUrl: './set-logger.component.css',
})
export class SetLoggerComponent {
  setNumber   = input.required<number>();
  exerciseId  = input.required<string>();
  exerciseName = input.required<string>();
  previousSet = input<SetLog | null>(null);

  setLogged = output<Omit<SetLog, 'id'>>();

  weight = signal(0);
  reps   = signal(10);

  constructor() {
    // Al recibir un set anterior, actualizamos los valores por defecto
    effect(() => {
      const prev = this.previousSet();
      if (prev) {
        this.weight.set(prev.weightKg);
        this.reps.set(prev.repsDone);
      }
    }, { allowSignalWrites: true });
  }

  adjustWeight(delta: number): void {
    this.weight.update(w => Math.max(0, +(w + delta).toFixed(1)));
  }

  adjustReps(delta: number): void {
    this.reps.update(r => Math.max(1, r + delta));
  }

  onLog(): void {
    this.setLogged.emit({
      exerciseId:   this.exerciseId(),
      exerciseName: this.exerciseName(),
      setNumber:    this.setNumber(),
      weightKg:     this.weight(),
      repsDone:     this.reps(),
    });
  }
}
