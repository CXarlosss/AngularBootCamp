import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetLog } from '../../../core/models/workout-log.model';

@Component({
  selector: 'app-set-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-backdrop" (click)="close.emit()">
      <div class="editor-content" (click)="$event.stopPropagation()">
        <h3>Editar Serie {{ set.setNumber }}</h3>
        <p class="subtitle">{{ set.exerciseName }}</p>
        
        <div class="inputs-grid">
          <!-- Peso -->
          <div class="input-group">
            <label>Peso (kg)</label>
            <div class="stepper">
              <button (click)="weight = weight - 1">-</button>
              <input type="number" [(ngModel)]="weight" />
              <button (click)="weight = weight + 1">+</button>
            </div>
          </div>
          
          <!-- Reps -->
          <div class="input-group">
            <label>Repeticiones</label>
            <div class="stepper">
              <button (click)="reps = reps - 1">-</button>
              <input type="number" [(ngModel)]="reps" />
              <button (click)="reps = reps + 1">+</button>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <button class="cancel-btn" (click)="close.emit()">Cancelar</button>
          <button class="save-btn" (click)="saveSet()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .editor-content {
      background: #1e293b;
      width: 100%;
      max-width: 400px;
      border-radius: 24px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h3 {
      margin: 0;
      color: white;
      font-size: 20px;
      text-align: center;
    }
    .subtitle {
      color: #94a3b8;
      text-align: center;
      margin: 4px 0 24px 0;
      font-size: 14px;
    }
    .inputs-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }
    .input-group label {
      display: block;
      color: #cbd5e1;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
    }
    .stepper {
      display: flex;
      background: #0f172a;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
      overflow: hidden;
      height: 64px;
    }
    .stepper button {
      width: 64px;
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stepper button:active {
      background: rgba(255,255,255,0.05);
    }
    .stepper input {
      flex: 1;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      width: 100%;
      outline: none;
      -moz-appearance: textfield;
    }
    .stepper input::-webkit-outer-spin-button,
    .stepper input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    .actions {
      display: flex;
      gap: 12px;
    }
    .actions button {
      flex: 1;
      height: 52px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 16px;
      border: none;
      cursor: pointer;
    }
    .cancel-btn {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    .save-btn {
      background: #3b82f6;
      color: white;
    }
  `]
})
export class SetEditorComponent implements OnInit {
  @Input({ required: true }) set!: SetLog;
  @Output() save = new EventEmitter<{weightKg: number, repsDone: number}>();
  @Output() close = new EventEmitter<void>();

  weight = 0;
  reps = 0;

  ngOnInit() {
    this.weight = this.set.weightKg;
    this.reps = this.set.repsDone;
  }

  saveSet() {
    this.save.emit({
      weightKg: this.weight,
      repsDone: this.reps
    });
  }
}
