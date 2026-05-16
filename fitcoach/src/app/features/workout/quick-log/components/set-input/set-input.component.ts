import { 
  Component, input, output, inject, signal, computed, 
  viewChild, effect, OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickLogService } from '../../services/quick-log.service';
import { ExerciseValidationService } from '../../services/exercise-validation.service';
import { TelemetryService } from '../../../../../core/services/telemetry.service';
import { SetInputConfig, ValidationResult, XpPreview } from '../../models/quick-log.model';

@Component({
  selector: 'app-set-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="set-card" [class.completed]="isSaved()">
      <!-- Header: Set number + objetivo -->
      <div class="set-header">
        <div class="set-number">
          <span class="badge">{{ config().setIndex }}</span>
          <span class="of-total">/ {{ config().totalSets }}</span>
        </div>
        <div class="target-pill">
          Objetivo: {{ config().targetWeight }}kg × {{ config().targetReps }}
        </div>
        @if (isSaved()) {
          <span class="checkmark">✓</span>
        }
      </div>

      <!-- Quick Weight Adjuster -->
      <div class="quick-section">
        <label class="section-label">Peso (kg)</label>
        <div class="quick-buttons">
          @for (inc of quickLog.weightIncrements; track inc) {
            <button 
              type="button"
              class="quick-btn"
              [class.negative]="inc < 0"
              [class.primary]="inc === 2.5 || inc === -2.5"
              (click)="adjustWeight(inc)"
              [disabled]="(weight() + inc) < 0 || isSaved()">
              {{ inc > 0 ? '+' : '' }}{{ inc }}
            </button>
          }
        </div>
        
        <!-- Input manual con validación visual -->
        <div class="input-wrapper" [class.error]="validation()?.severity === 'error'">
          <input 
            type="number" 
            [ngModel]="weight()" 
            (ngModelChange)="onWeightInput($event)"
            class="main-input"
            step="0.5"
            min="0"
            [disabled]="isSaved()"
            placeholder="0.0" />
          <span class="unit">kg</span>
        </div>
      </div>

      <!-- Quick Reps Adjuster -->
      <div class="quick-section">
        <label class="section-label">Reps</label>
        <div class="quick-buttons reps">
          @for (inc of quickLog.repIncrements; track inc) {
            <button 
              type="button"
              class="quick-btn small"
              [class.negative]="inc < 0"
              (click)="adjustReps(inc)"
              [disabled]="(reps() + inc) < 0 || isSaved()">
              {{ inc > 0 ? '+' : '' }}{{ inc }}
            </button>
          }
        </div>
        <div class="input-wrapper" [class.error]="validation()?.severity === 'error'">
          <input 
            type="number" 
            [ngModel]="reps()" 
            (ngModelChange)="onRepsInput($event)"
            class="main-input"
            min="0"
            [disabled]="isSaved()"
            placeholder="0" />
          <span class="unit">reps</span>
        </div>
      </div>

      <!-- Swipe hint: copiar serie anterior -->
      @if (canCopyPrevious()) {
        <div class="copy-hint" (click)="copyPreviousSet()">
          <span class="hint-icon">↔️</span>
          <span class="hint-text">
            Misma serie anterior: {{ quickLog.suggestedWeight() }}kg × {{ quickLog.suggestedReps() }}
          </span>
        </div>
      }

      <!-- Validación en tiempo real -->
      @if (validation(); as v) {
        <div class="validation-toast" [class]="v.severity">
          {{ v.warning }}
        </div>
      }

      <!-- XP Preview (feedback inmediato) -->
      @if (xpPreview(); as xp) {
        <div class="xp-preview">
          <span class="xp-icon">⚡</span>
          <span class="xp-text">+{{ xp.setXp }} XP esta serie</span>
          <span class="xp-total">Total: {{ xp.sessionTotal }}</span>
        </div>
      }

      <!-- Botón de acción -->
      <div class="action-row">
        @if (!isSaved()) {
          <button 
            class="save-btn"
            (click)="saveSet()"
            [disabled]="!canSave()">
            Guardar serie
          </button>
        } @else {
          <button 
            class="undo-btn"
            (click)="requestUndo()"
            [disabled]="!canUndo()">
            Deshacer ({{ remainingGraceSeconds() }}s)
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; margin-bottom: 12px; }
    
    .set-card {
      background: #1e1e2e;
      border-radius: 16px;
      padding: 16px;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }
    .set-card.completed {
      border-color: #4CAF50;
      opacity: 0.85;
    }
    
    .set-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .set-number { display: flex; align-items: center; gap: 4px; }
    .badge {
      background: #4CAF50;
      color: #fff;
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px;
    }
    .of-total { color: #888; font-size: 12px; }
    .target-pill {
      background: #2d2d44;
      color: #aaa;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
    .checkmark { color: #4CAF50; font-size: 20px; font-weight: 700; }
    
    .quick-section { margin-bottom: 12px; }
    .section-label {
      display: block;
      color: #888;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .quick-buttons {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }
    .quick-btn {
      flex: 1;
      padding: 10px 4px;
      border: none;
      border-radius: 10px;
      background: #2d2d44;
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      user-select: none;
    }
    .quick-btn:active:not(:disabled) { transform: scale(0.92); background: #3d3d5c; }
    .quick-btn.negative { background: #3d2d2d; color: #ff6b6b; }
    .quick-btn.primary { background: #4CAF50; color: #fff; }
    .quick-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .quick-btn.small { padding: 8px 4px; font-size: 12px; }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      background: #2d2d44;
      border-radius: 12px;
      padding: 0 14px;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }
    .input-wrapper.error { border-color: #f44336; }
    .input-wrapper:focus-within { border-color: #4CAF50; }
    
    .main-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      padding: 12px 0;
      width: 100%;
    }
    .main-input:focus { outline: none; }
    .unit { color: #888; font-size: 14px; margin-left: 8px; }
    
    .copy-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(76, 175, 80, 0.1);
      border: 1px dashed #4CAF50;
      border-radius: 10px;
      padding: 10px 14px;
      margin: 10px 0;
      cursor: pointer;
      transition: background 0.2s;
    }
    .copy-hint:hover { background: rgba(76, 175, 80, 0.2); }
    .hint-icon { font-size: 16px; }
    .hint-text { color: #4CAF50; font-size: 13px; font-weight: 500; }
    
    .validation-toast {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      margin: 8px 0;
    }
    .validation-toast.error { background: #3d2d2d; color: #ff6b6b; }
    .validation-toast.warning { background: #3d3d2d; color: #ffc107; }
    .validation-toast.info { background: #2d3d44; color: #64b5f6; }
    
    .xp-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 193, 7, 0.1);
      border-radius: 10px;
      padding: 10px 14px;
      margin: 10px 0;
    }
    .xp-icon { font-size: 16px; }
    .xp-text { color: #ffc107; font-size: 13px; font-weight: 600; }
    .xp-total { color: #888; font-size: 12px; margin-left: auto; }
    
    .action-row { margin-top: 12px; }
    .save-btn, .undo-btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .save-btn {
      background: #4CAF50;
      color: #fff;
    }
    .save-btn:hover:not(:disabled) { background: #45a049; }
    .save-btn:disabled { background: #2d2d44; color: #666; cursor: not-allowed; }
    
    .undo-btn {
      background: #2d2d44;
      color: #ff9800;
      border: 2px solid #ff9800;
    }
    .undo-btn:hover:not(:disabled) { background: rgba(255, 152, 0, 0.1); }
    .undo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class SetInputComponent implements OnDestroy {
  // Inputs
  readonly config = input.required<SetInputConfig>();
  
  // Outputs
  readonly onSave = output<{ weight: number; reps: number; setIndex: number }>();
  readonly onUndo = output<{ setIndex: number }>();
  
  // Services
  protected quickLog = inject(QuickLogService);
  private validationService = inject(ExerciseValidationService);
  private telemetry = inject(TelemetryService);
  
  // Estado local con Signals
  protected weight = signal(0);
  protected reps = signal(0);
  protected isSaved = signal(false);
  protected validation = signal<ValidationResult | null>(null);
  protected xpPreview = signal<XpPreview | null>(null);
  
  // Métricas y tiempos
  private setStartTime = Date.now();
  private savedAt = 0;
  private lastInputMethod: 'quick_button' | 'manual' | 'swipe_copy' = 'manual';

  // Grace period para undo
  private graceTimer: any;
  protected remainingGraceSeconds = signal(0);
  protected canUndo = signal(false);
  
  // Computed
  protected canCopyPrevious = computed(() => 
    this.quickLog.canSuggestCopy(this.config()) && !this.isSaved()
  );
  
  protected canSave = computed(() => 
    this.weight() > 0 && this.reps() > 0 && !this.isSaved() && 
    (this.validation()?.valid ?? true)
  );

  constructor() {
    // Pre-fill con sugerencias
    effect(() => {
      const cfg = this.config();
      const suggestedWeight = this.quickLog.suggestedWeight();
      const suggestedReps = this.quickLog.suggestedReps();
      
      if (suggestedWeight && cfg.setIndex > 1) {
        this.weight.set(suggestedWeight);
      } else {
        this.weight.set(cfg.targetWeight);
      }
      
      if (suggestedReps && cfg.setIndex > 1) {
        this.reps.set(suggestedReps);
      } else {
        this.reps.set(cfg.targetReps);
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    if (this.graceTimer) clearInterval(this.graceTimer);
  }

  // --- Métodos públicos ---

  adjustWeight(delta: number): void {
    if (this.isSaved()) return;
    this.lastInputMethod = 'quick_button';
    this.weight.set(this.quickLog.adjustWeight(this.weight(), delta));
    
    this.telemetry.track('weight_adjusted', {
      method: 'quick_button',
      delta,
      exercise: this.config().exerciseName,
      set_index: this.config().setIndex
    });
    
    this.validate();
  }

  adjustReps(delta: number): void {
    if (this.isSaved()) return;
    this.lastInputMethod = 'quick_button';
    this.reps.set(this.quickLog.adjustReps(this.reps(), delta));
    this.validate();
  }

  onWeightInput(value: number): void {
    this.lastInputMethod = 'manual';
    this.weight.set(value || 0);
    this.validateDebounced();
  }

  onRepsInput(value: number): void {
    this.lastInputMethod = 'manual';
    this.reps.set(value || 0);
    this.validateDebounced();
  }

  copyPreviousSet(): void {
    if (!this.canCopyPrevious()) return;
    this.lastInputMethod = 'swipe_copy';
    const w = this.quickLog.suggestedWeight();
    const r = this.quickLog.suggestedReps();
    if (w !== null) this.weight.set(w);
    if (r !== null) this.reps.set(r);
    
    this.telemetry.track('weight_adjusted', {
      method: 'swipe_copy',
      exercise: this.config().exerciseName,
      set_index: this.config().setIndex
    });
    
    this.validate();
  }

  saveSet(): void {
    if (!this.canSave()) return;
    
    const w = this.weight();
    const r = this.reps();
    const cfg = this.config();
    
    this.savedAt = Date.now();
    
    // Guardar en quick log para siguiente serie
    this.quickLog.saveLastSet(cfg.exerciseId, w, r, cfg.setIndex);
    
    // Marcar como guardado
    this.isSaved.set(true);
    
    // Calcular XP preview
    this.calculateXpPreview(w, r, cfg.targetWeight);
    
    // Telemetría
    this.telemetry.track('set_saved', {
      exercise: this.config().exerciseName,
      weight: w,
      reps: r,
      set_index: cfg.setIndex,
      input_method: this.lastInputMethod,
      time_to_complete_ms: this.savedAt - this.setStartTime,
      validation_warnings: this.validation()?.severity !== 'info'
    });

    // Emitir evento
    this.onSave.emit({ weight: w, reps: r, setIndex: cfg.setIndex });
    
    // Activar grace period
    this.startGracePeriod();
  }

  requestUndo(): void {
    if (!this.canUndo()) return;
    
    this.telemetry.track('undo_triggered', {
      action_type: 'set',
      time_since_save_ms: Date.now() - this.savedAt
    });

    this.isSaved.set(false);
    this.xpPreview.set(null);
    this.canUndo.set(false);
    this.remainingGraceSeconds.set(0);
    
    if (this.graceTimer) clearInterval(this.graceTimer);
    
    this.onUndo.emit({ setIndex: this.config().setIndex });
  }

  // --- Privados ---

  private validationTimer: any;
  private validateDebounced(): void {
    clearTimeout(this.validationTimer);
    this.validationTimer = setTimeout(() => this.validate(), 300);
  }

  private validate(): void {
    const result = this.validationService.validate(
      this.config().exerciseName,
      this.weight(),
      this.reps()
    );
    this.validation.set(result);
  }

  private calculateXpPreview(weight: number, reps: number, targetWeight: number): void {
    // XP básico: +1 por serie
    let setXp = 1;
    
    // Bonus por superar objetivo
    if (weight >= targetWeight) {
      setXp += 2;
    }
    
    // Calcular total acumulado de la sesión sumando series previas (ahora bien)
    const previousXp = this.config().previousSets.reduce((sum, s) => sum + (s as any).xp || 0, 0);
    const sessionTotal = previousXp + setXp;

    this.xpPreview.set({
      setXp,
      sessionTotal,
      rankProgress: {
        currentDivision: 'Recruta IV',
        percentToNext: 12.8,
        xpToNextDivision: 109
      }
    });
  }

  private startGracePeriod(): void {
    this.canUndo.set(true);
    this.remainingGraceSeconds.set(5);
    
    this.graceTimer = setInterval(() => {
      const remaining = this.remainingGraceSeconds() - 1;
      this.remainingGraceSeconds.set(remaining);
      
      if (remaining <= 0) {
        this.canUndo.set(false);
        clearInterval(this.graceTimer);
      }
    }, 1000);
  }
}
