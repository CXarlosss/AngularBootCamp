import {
  Component, Output, EventEmitter, inject,
  signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeightLogService, WeightEntry } from './weight-log.service';

@Component({
  selector: 'app-weight-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="backdrop" (click)="discardAndClose()"></div>

    <!-- Sheet -->
    <div class="sheet" role="dialog" aria-label="Registrar peso">
      <div class="handle"></div>

      <div class="sheet-header">
        <h2 class="sheet-title">Registrar peso</h2>
        <p class="sheet-date">{{ todayLabel }}</p>
      </div>

      <!-- Display de peso -->
      <div class="weight-row">
        <span class="weight-display">{{ weight().toFixed(1) }}</span>
        <span class="weight-unit">kg</span>
      </div>

      @if (lastEntry()) {
        <p class="last-weight">
          Último: {{ lastEntry()!.weight_kg | number:'1.1-1' }} kg
          ({{ daysAgo() }}{{ daysAgo() === 1 ? ' día' : ' días' }})
          <span class="delta" [class.loss]="delta() < 0" [class.gain]="delta() > 0">
            @if (delta() !== 0) {
              {{ delta() > 0 ? '+' : '' }}{{ delta() | number:'1.1-1' }} kg
            }
          </span>
        </p>
      }

      <!-- Steppers -->
      <div class="stepper-grid">
        <button class="step-btn minus" (click)="adjust(-1)">−<span>1kg</span></button>
        <button class="step-btn minus" (click)="adjust(-0.1)">−<span>0.1</span></button>
        <button class="step-btn plus"  (click)="adjust(0.1)">+<span>0.1</span></button>
        <button class="step-btn plus"  (click)="adjust(1)">+<span>1kg</span></button>
      </div>

      <!-- Nota opcional -->
      <textarea
        class="note-field"
        placeholder="Nota (en ayunas, por la noche...)"
        [(ngModel)]="note"
        rows="2"
        maxlength="120">
      </textarea>

      <!-- CTA -->
      <button
        class="save-btn"
        [class.saved]="saved()"
        [disabled]="saving()"
        (click)="save()">
        {{ saved() ? '✓ Guardado' : saving() ? 'Guardando...' : 'Guardar peso' }}
      </button>
    </div>
  `,
  styleUrl: './weight-bottom-sheet.component.scss',
})
export class WeightBottomSheetComponent implements OnInit, OnDestroy {
  @Output() close   = new EventEmitter<void>();
  @Output() saved$  = new EventEmitter<number>(); // emite el peso guardado

  private svc = inject(WeightLogService);

  weight   = signal(80.0);
  note     = '';
  saving   = signal(false);
  saved    = signal(false);
  isDiscarding = false;
  lastEntry = signal<WeightEntry | null>(null);

  todayLabel = this.buildTodayLabel();

  delta = computed(() => {
    const last = this.lastEntry();
    if (!last) return 0;
    return +(this.weight() - last.weight_kg).toFixed(1);
  });

  daysAgo = computed(() =>
    this.svc.daysSinceLastEntry(this.lastEntry())
  );

  async ngOnInit() {
    const last = await this.svc.getLastEntry();
    this.lastEntry.set(last);
    
    // Restaurar el borrador si el usuario cambió de pestaña
    if (this.svc.draftWeight !== null) {
      this.weight.set(this.svc.draftWeight);
      this.note = this.svc.draftNote;
    } else if (last) {
      // Partir del último peso registrado como valor inicial
      this.weight.set(last.weight_kg);
    }
  }

  ngOnDestroy() {
    // Si no se guardó el peso y no se cerró explícitamente, guardar el borrador temporal
    if (!this.saved() && !this.isDiscarding) {
      this.svc.draftWeight = this.weight();
      this.svc.draftNote = this.note;
    }
  }

  discardAndClose() {
    this.isDiscarding = true;
    this.svc.clearDraft();
    this.close.emit();
  }

  adjust(delta: number) {
    const next = Math.round((this.weight() + delta) * 10) / 10;
    this.weight.set(Math.max(30, Math.min(250, next)));
  }

  async save() {
    if (this.saving() || this.saved()) return;
    this.saving.set(true);

    try {
      await this.svc.logWeight(this.weight(), this.note.trim() || undefined);
      this.saved.set(true);
      this.svc.clearDraft(); // Limpiar el borrador porque ya se guardó
      this.saved$.emit(this.weight());
      // Cerrar tras feedback visual
      setTimeout(() => this.close.emit(), 1200);
    } catch (e) {
      console.error('Error guardando peso:', e);
      this.saving.set(false);
    }
  }

  private buildTodayLabel(): string {
    const d = new Date();
    const days   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const months = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `Hoy, ${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
  }
}
