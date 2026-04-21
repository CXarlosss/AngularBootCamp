import {
  Component, inject, signal, computed,
  ChangeDetectionStrategy, OnInit, OnDestroy, effect, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutStore }    from '../../../state/workout.store';
import { ClientRoutineService } from '../../../core/services/client-routine.service';
import { AuthService }     from '../../../core/auth/auth.service';
import { RestTimerService } from '../../../core/services/rest-timer.service';
import { SetLoggerComponent } from '../../../shared/components/set-logger/set-logger.component';
import { AssignedRoutine, Exercise, RoutineDay } from '../../../core/models/routine.model';
import { SetLog }          from '../../../core/models/workout-log.model';

interface ExerciseState {
  exercise:      Exercise;
  completedSets: SetLog[];
  isActive:      boolean;
}

@Component({
  selector: 'fc-today-workout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SetLoggerComponent],
  template: `
    <div class="workout-screen">

      <header class="workout-header">
        <button class="btn-back" (click)="confirmExit()">←</button>
        <div class="workout-meta">
          <h1 class="workout-title">{{ todayDay()?.label ?? 'Entrenamiento' }}</h1>
          <p class="workout-progress">
            {{ completedExercises() }} / {{ exerciseStates().length }} ejercicios
          </p>
        </div>

        <!-- Anillo de progreso reactivo -->
        <div class="ring-wrapper overall-ring">
          <svg viewBox="0 0 44 44" width="44" height="44">
            <circle cx="22" cy="22" r="18"
              fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
            <circle cx="22" cy="22" r="18"
              fill="none"
              [attr.stroke]="allDone() ? '#1D9E75' : '#1D9E75'"
              stroke-width="3"
              [attr.stroke-dasharray]="overallProgress() + ' 100'"
              stroke-dashoffset="25"
              stroke-linecap="round"
              transform="rotate(-90 22 22)"
              style="transition: stroke-dasharray .4s ease"/>
          </svg>
          <div class="ring-text" [class.complete]="allDone()">
            @if (allDone()) { ✓ } @else { {{ overallProgress() }}% }
          </div>
        </div>
      </header>

      <!-- ── Timer de descanso (overlay cuando está activo) ── -->
      @if (timer.isRunning()) {
        <div class="rest-overlay">
          <div class="rest-card">
            <p class="rest-label">Descansando</p>
            <div class="rest-circle">
              <svg viewBox="0 0 100 100" width="140" height="140">
                <circle cx="50" cy="50" r="44" fill="none"
                  stroke="rgba(255,255,255,0.04)" stroke-width="6"/>
                <circle cx="50" cy="50" r="44" fill="none"
                  stroke="#1D9E75" stroke-width="6"
                  [attr.stroke-dasharray]="(276 - (timer.progress() * 2.76)) + ' 276'"
                  stroke-dashoffset="69"
                  stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <span class="rest-time">{{ timer.remaining() }}</span>
            </div>
            <button class="btn-skip" (click)="timer.skip()">Saltar descanso</button>
          </div>
        </div>
      }

      <div class="exercises-list">
        @for (state of exerciseStates(); track state.exercise.id; let i = $index) {
          <div
            class="exercise-card"
            [class.active]="state.isActive && !isExerciseDone(state)"
            [class.done]="isExerciseDone(state)"
            [class.future]="!state.isActive && !isExerciseDone(state)"
          >
            <div class="ex-card-header" (click)="setActiveExercise(i)">
              <div class="ex-done-indicator">
                @if (isExerciseDone(state)) {
                  <span class="check">✓</span>
                } @else {
                  <span class="ex-num">{{ i + 1 }}</span>
                }
              </div>
              <div class="ex-card-meta">
                <h3 class="ex-card-name">{{ state.exercise.name }}</h3>
                <p class="ex-card-target">
                  @if (state.exercise.targetWeight) {
                    {{ state.exercise.targetWeight }}kg ·
                  }
                  {{ state.exercise.sets }} series ·
                  {{ state.exercise.restSeconds }}s descanso
                </p>
              </div>
              <div class="ex-sets-summary">
                <span class="sets-done">{{ state.completedSets.length }}</span>
                <span class="sets-total">/{{ state.exercise.sets }}</span>
              </div>
            </div>

            @if (state.completedSets.length > 0) {
              <div class="sets-history">
                @for (set of state.completedSets; track set.id) {
                  <div class="set-chip" (click)="editSet(set)">
                    <span class="set-chip-num">S{{ set.setNumber }}</span>
                    <span class="set-chip-val">{{ set.weightKg }}kg×{{ set.repsDone }}</span>
                  </div>
                }
              </div>
            }

            @if (state.isActive && !isExerciseDone(state)) {
              <div class="set-logger-wrap">
                <fc-set-logger
                  [setNumber]="state.completedSets.length + 1"
                  [exerciseId]="state.exercise.id"
                  [exerciseName]="state.exercise.name"
                  [previousSet]="lastSet(state)"
                  (setLogged)="onSetLogged($event, state.exercise)"
                />
              </div>
            }

            @if (state.exercise.notes) {
              <p class="coach-note">{{ state.exercise.notes }}</p>
            }
          </div>
        }
      </div>

      <!-- ── Banner completar ── -->
      @if (allDone() && !workoutStore.activeLog()?.completed) {
        <div class="complete-banner">
          <div class="complete-stats">
            <span><span class="cs-value">{{ totalSets() }}</span> series</span>
            <span class="cs-sep">·</span>
            <span><span class="cs-value">{{ totalVolume() | number:'1.0-0' }}</span> kg vol.</span>
          </div>
          <button
            class="btn-complete"
            [disabled]="workoutStore.loading()"
            (click)="completeWorkout()"
          >
            {{ workoutStore.loading() ? 'Guardando...' : 'Completar entrenamiento' }}
          </button>
        </div>
      }

    </div>
  `,
  styleUrl: './today-workout.component.css'
})
export class TodayWorkoutComponent implements OnInit, OnDestroy {
  workoutStore = inject(WorkoutStore);
  clientRoutineSvc = inject(ClientRoutineService);
  auth         = inject(AuthService);
  timer        = inject(RestTimerService);
  router       = inject(Router);
  private route = inject(ActivatedRoute);

  activeExerciseIndex = signal(0);
  activeRoutine = signal<AssignedRoutine | null>(null);
  selectedDayId = signal<string | null>(null);

  constructor() {
    // Efecto para auto-scrollear al ejercicio activo
    effect(() => {
      const index = this.activeExerciseIndex();
      // Pequeño delay para dejar que Angular renderice la expansión de la card
      setTimeout(() => {
        const activeCard = document.querySelector('.exercise-card.active');
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    });
  }

  todayDay = computed((): RoutineDay | null => {
    const r = this.activeRoutine()?.routine;
    if (!r) return null;

    const forcedId = this.selectedDayId();
    if (forcedId) {
      return r.days.find(d => d.id === forcedId) ?? r.days[0];
    }

    const jsDay  = new Date().getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;
    return r.days.find(d => d.dayNumber === isoDay) ?? r.days[0];
  });

  exerciseStates = computed((): ExerciseState[] => {
    const day  = this.todayDay();
    const log  = this.workoutStore.activeLog();
    if (!day) return [];

    return day.exercises.map((exercise, i) => {
      const completedSets = (log?.sets ?? []).filter(
        s => s.exerciseId === exercise.id
      );
      return {
        exercise,
        completedSets,
        isActive: i === this.activeExerciseIndex(),
      };
    });
  });

  completedExercises = computed(() =>
    this.exerciseStates().filter(s => this.isExerciseDone(s)).length
  );

  overallProgress = computed(() => {
    const states = this.exerciseStates();
    if (!states.length) return 0;
    const totalSets    = states.reduce((s, e) => s + e.exercise.sets, 0);
    const completedSets = states.reduce((s, e) => s + e.completedSets.length, 0);
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  });

  allDone = computed(() =>
    this.exerciseStates().length > 0 &&
    this.exerciseStates().every(s => this.isExerciseDone(s))
  );

  totalSets = computed(() =>
    this.workoutStore.activeLog()?.sets.length ?? 0
  );

  totalVolume = computed(() =>
    (this.workoutStore.activeLog()?.sets ?? [])
      .reduce((sum, s) => sum + s.weightKg * s.repsDone, 0)
  );

  async ngOnInit(): Promise<void> {
    const user = this.auth.profile();
    if (!user) return;

    this.selectedDayId.set(this.route.snapshot.queryParams['dayId'] ?? null);

    const assigned = await this.clientRoutineSvc.getActiveRoutine(user.id);
    this.activeRoutine.set(assigned);

    if (assigned) this.workoutStore.startWorkout(assigned.id, user.id);
  }

  ngOnDestroy(): void {
    this.timer.stop();
  }

  isExerciseDone(state: ExerciseState): boolean {
    return state.completedSets.length >= state.exercise.sets;
  }

  lastSet(state: ExerciseState): SetLog | null {
    return state.completedSets[state.completedSets.length - 1] ?? null;
  }

  setActiveExercise(index: number): void {
    this.activeExerciseIndex.set(index);
  }

  onSetLogged(
    set: Omit<SetLog, 'id'>,
    exercise: Exercise
  ): void {
    this.workoutStore.logSet(set);

    // Buscamos el estado actualizado (después del push al store)
    const state = this.exerciseStates().find(
      s => s.exercise.id === exercise.id
    );

    if (state && !this.isExerciseDone(state)) {
      // Más series pendientes → iniciar timer de descanso
      this.timer.start(exercise.restSeconds);
    } else {
      // Ejercicio terminado → avanzar al siguiente
      const nextIndex = this.activeExerciseIndex() + 1;
      if (nextIndex < this.exerciseStates().length) {
        this.activeExerciseIndex.set(nextIndex);
        this.timer.start(exercise.restSeconds);
      }
    }
  }

  editSet(set: SetLog): void {
    // En v2: abrir mini-modal para corregir peso/reps
    console.log('edit set', set.id);
  }

  async completeWorkout(): Promise<void> {
    await this.workoutStore.completeWorkout();
    this.router.navigate(['/client/progress']);
  }

  confirmExit(): void {
    if (this.totalSets() > 0 && !this.allDone()) {
      if (!confirm('¿Salir? El progreso de esta sesión se perderá.')) return;
    }
    this.router.navigate(['/client/dashboard']);
  }
}
