import {
  Component, inject, signal, computed,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoutineStore } from '../../../state/routine.store';
import { AuthService } from '../../../core/auth/auth.service';
import { ExerciseRowComponent } from './exercise-row.component';
import { AssignModalComponent } from './assign-modal.component';

@Component({
  selector: 'fc-routine-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ExerciseRowComponent, AssignModalComponent],
  template: `
    <div class="builder-layout">

      <!-- ── Sidebar izquierdo: meta de la rutina ── -->
      <aside class="builder-sidebar">
        <h2 class="section-title">Nueva rutina</h2>

        <label class="field-label">Nombre</label>
        <input
          type="text"
          placeholder="Ej: Fuerza 4 días"
          [value]="store.draft()?.name ?? ''"
          (input)="store.updateDraftField('name', $any($event.target).value)"
          class="field-input"
        />

        <label class="field-label">Objetivo</label>
        <select
          [value]="store.draft()?.goal ?? 'hypertrophy'"
          (change)="store.updateDraftField('goal', $any($event.target).value)"
          class="field-input"
        >
          <option value="hypertrophy">Hipertrofia</option>
          <option value="strength">Fuerza</option>
          <option value="weight_loss">Pérdida de peso</option>
          <option value="mobility">Movilidad</option>
        </select>

        <div class="stats-box">
          <div class="stat">
            <span class="stat-val">{{ store.draft()?.days?.length ?? 0 }}</span>
            <span class="stat-lbl">días</span>
          </div>
          <div class="stat">
            <span class="stat-val">{{ store.totalExercises() }}</span>
            <span class="stat-lbl">ejercicios</span>
          </div>
        </div>

        <!-- Biblioteca de ejercicios rápida -->
        <label class="field-label" style="margin-top: 1rem">Biblioteca</label>
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          [ngModel]="exerciseSearch()"
          (ngModelChange)="exerciseSearch.set($event)"
          class="field-input"
        />
        <div class="exercise-library">
          @for (ex of filteredLibrary(); track ex) {
            <button
              class="library-item"
              (click)="addFromLibrary(ex)"
              [disabled]="!store.activeDay()"
            >
              {{ ex }}
            </button>
          }
        </div>

        <!-- Acciones -->
        <div class="sidebar-actions">
          <button
            class="btn-secondary"
            (click)="store.saveAsTemplate()"
            [disabled]="!store.isValid() || store.saving()"
          >
            {{ store.saving() ? 'Guardando...' : 'Guardar template' }}
          </button>
          <button
            class="btn-primary"
            (click)="showAssignModal.set(true)"
            [disabled]="!store.isValid()"
          >
            Asignar a clientes
          </button>
        </div>
      </aside>

      <!-- ── Área central: días y ejercicios ── -->
      <main class="builder-main">

        <!-- Tabs de días -->
        <div class="days-tabs">
          @for (day of store.draft()?.days ?? []; track day.id; let i = $index) {
            <button
              class="day-tab"
              [class.active]="store.activeDayIndex() === i"
              (click)="store.setActiveDay(i)"
            >
              {{ day.label }}
              <span
                class="remove-day"
                (click)="$event.stopPropagation(); store.removeDay(day.id)"
              >×</span>
            </button>
          }
          <button class="day-tab add-day" (click)="store.addDay()">
            + Añadir día
          </button>
        </div>

        <!-- Contenido del día activo -->
        @if (store.activeDay(); as day) {
          <div class="day-content">

            <input
              type="text"
              class="day-name-input"
              placeholder="Nombre del día (ej: Pecho y tríceps)"
              [value]="day.label"
              (change)="store.updateDayLabel(day.id, $any($event.target).value)"
            />

            <!-- Lista de ejercicios -->
            @if (day.exercises.length === 0) {
              <div class="empty-day">
                Busca un ejercicio en la biblioteca o escríbelo abajo para añadirlo.
              </div>
            }

            @for (ex of day.exercises; track ex.id; let i = $index) {
              <fc-exercise-row
                [exercise]="ex"
                [index]="i"
                (updated)="store.updateExercise(day.id, ex.id, $event)"
                (removed)="store.removeExercise(day.id, ex.id)"
              />
            }

            <!-- Añadir ejercicio personalizado -->
            <div class="add-exercise-row">
              <input
                #customExInput
                type="text"
                placeholder="Nombre del ejercicio personalizado..."
                class="field-input"
                (keydown.enter)="addCustom(day.id, customExInput)"
              />
              <button
                class="btn-add"
                (click)="addCustom(day.id, customExInput)"
              >
                Añadir
              </button>
            </div>

          </div>
        } @else {
          <div class="empty-state">
            Añade un día de entrenamiento para empezar a construir la rutina.
          </div>
        }
      </main>

    </div>

    <!-- Modal de asignación -->
    @if (showAssignModal()) {
      <fc-assign-modal
        (confirmed)="onAssign($event)"
        (cancelled)="showAssignModal.set(false)"
      />
    }
  `,
  styleUrl: './routine-builder.component.css'
})
export class RoutineBuilderComponent implements OnInit {
  store         = inject(RoutineStore);
  auth          = inject(AuthService);
  router        = inject(Router);

  showAssignModal = signal(false);
  exerciseSearch  = signal('');

  // Biblioteca predefinida (en producción viene de Supabase)
  private library = [
    'Press banca', 'Press banca inclinado', 'Aperturas con mancuernas',
    'Fondos en paralelas', 'Sentadilla', 'Sentadilla búlgara', 'Prensa de piernas',
    'Peso muerto', 'Hip thrust', 'Zancadas', 'Curl femoral', 'Extensión de cuádriceps',
    'Dominadas', 'Remo con barra', 'Remo con mancuerna', 'Jalón al pecho',
    'Press militar', 'Elevaciones laterales', 'Face pull', 'Curl de bíceps',
    'Extensión de tríceps', 'Fondos en banco', 'Plancha', 'Crunch',
    'Cardio HIIT', 'Caminata en cinta', 'Bicicleta estática',
  ];

  filteredLibrary = computed(() => {
    const q = this.exerciseSearch().toLowerCase().trim();
    if (!q) return this.library.slice(0, 8);
    return this.library.filter(e => e.toLowerCase().includes(q)).slice(0, 10);
  });

  ngOnInit(): void {
    const coachId = this.auth.profile()?.id;
    if (coachId) {
      this.store.newDraft(coachId);
      this.store.loadTemplates(coachId);
    }
  }

  addFromLibrary(name: string): void {
    const day = this.store.activeDay();
    if (day) this.store.addExercise(day.id, name);
  }

  addCustom(dayId: string, input: HTMLInputElement): void {
    const name = input.value.trim();
    if (!name) return;
    this.store.addExercise(dayId, name);
    input.value = '';
  }

  async onAssign(clientIds: string[]): Promise<void> {
    this.showAssignModal.set(false);
    await this.store.saveAndAssign(clientIds);
    this.router.navigate(['/coach/clients']);
  }
}
