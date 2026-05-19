import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../core/supabase.client';
import { WorkoutBlockedError } from '../../../core/models/errors.model';
import { WorkoutStore } from '../../../state/workout.store';
import { ClientRoutineService } from '../../../core/services/client-routine.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RestTimerService } from '../../../core/services/rest-timer.service';
import { SetLoggerComponent } from '../../../shared/components/set-logger/set-logger.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { HapticService } from '../../../core/services/haptic.service';
import { AssignedRoutine, Exercise, RoutineDay } from '../../../core/models/routine.model';
import { SetLog } from '../../../core/models/workout-log.model';
import { FormsModule } from '@angular/forms';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';


interface ExerciseState {
  exercise:      Exercise;
  completedSets: SetLog[];
  isActive:      boolean;
  isDone:        boolean;
}

@Component({
  selector: 'fc-today-workout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SetLoggerComponent, SkeletonComponent],
  template: `
    <div class="workout-screen">

      <header class="workout-header">
        <button class="btn-back" (click)="confirmExit()">←</button>
        <div class="workout-meta">
          <div class="title-row">
            <h1 class="workout-title">{{ todayDay()?.label ?? 'Entrenamiento' }}</h1>
            
            <div class="sync-status-indicator">
              @if (!syncQueue.isOnline()) {
                <div class="status-badge offline" title="Sin conexión. Guardando localmente.">
                  <span class="pulse-dot amber"></span>
                  <span>Offline</span>
                  @if (syncQueue.pendingCount() > 0) {
                    <span class="badge-count">{{ syncQueue.pendingCount() }}</span>
                  }
                </div>
              } @else if (syncQueue.isSyncing()) {
                <div class="status-badge syncing" title="Sincronizando...">
                  <span class="spinner-icon"></span>
                  <span>Sincronizando</span>
                </div>
              } @else if (syncQueue.pendingCount() > 0) {
                <div class="status-badge pending" title="Sincronización pendiente...">
                  <span class="pulse-dot orange"></span>
                  <span>Pendiente ({{ syncQueue.pendingCount() }})</span>
                </div>
              } @else {
                <div class="status-badge online" title="Conectado a la red">
                  <span class="pulse-dot green"></span>
                  <span>Conectado</span>
                </div>
              }
            </div>
          </div>
          <p class="workout-progress">
            {{ completedExercises() }} / {{ exerciseStates().length }} ejercicios
          </p>
        </div>

        <!-- Anillo de progreso reactivo (Circunferencia: 2 * PI * 18 = 113.1) -->
        <div class="ring-wrapper overall-ring">
          <svg viewBox="0 0 44 44" width="48" height="48">
            <circle cx="22" cy="22" r="19"
              fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2.5"/>
            <circle cx="22" cy="22" r="19"
              fill="none"
              stroke="#1D9E75"
              stroke-width="3"
              [attr.stroke-dasharray]="(overallProgress() / 100 * 119.38) + ' 119.38'"
              stroke-dashoffset="29.84"
              stroke-linecap="round"
              transform="rotate(-90 22 22)"
              style="transition: stroke-dasharray .6s cubic-bezier(0.16, 1, 0.3, 1)"/>
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
            <p class="rest-label">Tiempo de descanso</p>
            <div class="rest-circle">
              <svg viewBox="0 0 100 100" width="200" height="200">
                <circle cx="50" cy="50" r="48" fill="none"
                  stroke="rgba(255,255,255,0.04)" stroke-width="4"/>
                <circle cx="50" cy="50" r="48" fill="none"
                  stroke="#1D9E75" stroke-width="4"
                  [attr.stroke-dasharray]="(301.59 - (timer.progress() * 3.0159)) + ' 301.59'"
                  stroke-dashoffset="75.4"
                  stroke-linecap="round"
                  transform="rotate(-90 50 50)"
                  style="transition: stroke-dasharray 1s linear"/>
              </svg>
              <span class="rest-time">{{ timer.remaining() }}</span>
            </div>
            <button class="btn-skip" (click)="timer.skip()">
              Saltar descanso
            </button>
          </div>
        </div>
      }

      <div class="exercises-list">
        @if (isLoading()) {
          @for (i of [1,2,3,4]; track i) {
            <fc-skeleton type="exercise-card" />
          }
        } @else if (isDayDone()) {
          <div class="empty-state">
            <div class="empty-illustration">✅</div>
            <p>¡Entrenamiento completado!</p>
            <span class="empty-sub">Ya has dado el máximo por hoy. Descansa y vuelve mañana 💪</span>
            <button class="btn-back-dash" (click)="router.navigate(['/client/dashboard'])">
              Volver al inicio
            </button>
          </div>
        } @else if (exerciseStates().length === 0) {
          <div class="empty-state">
            <div class="empty-illustration">🏋️</div>
            <p>No hay ejercicios para hoy</p>
            <span class="empty-sub">Tu entrenador está preparando algo grande para ti</span>
          </div>
        } @else {
          @for (state of exerciseStates(); track state.exercise.id; let i = $index) {
            <div
              class="exercise-card"
              [class.active]="state.isActive && !state.isDone"
              [class.done]="state.isDone"
              [class.future]="!state.isActive && !state.isDone"
            >
              <div class="ex-card-header" (click)="setActiveExercise(i)">
                <div class="ex-done-indicator">
                  @if (state.isDone) {
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

              @if (state.isActive || exerciseNotes()[state.exercise.id] || state.completedSets.length > 0) {
                <div class="exercise-note-container">
                  <!-- Selector de sensaciones 👍/👎 -->
                  <div class="feeling-selector">
                    <button 
                      type="button" 
                      class="btn-feeling like" 
                      [class.active]="exerciseNotes()[state.exercise.id]?.startsWith('👍')"
                      (click)="toggleFeeling(state.exercise.id, 'like')"
                      title="Me ha gustado"
                    >
                      👍 Me ha gustado
                    </button>
                    <button 
                      type="button" 
                      class="btn-feeling dislike" 
                      [class.active]="exerciseNotes()[state.exercise.id]?.startsWith('👎')"
                      (click)="toggleFeeling(state.exercise.id, 'dislike')"
                      title="No me ha gustado"
                    >
                      👎 No me ha gustado
                    </button>
                  </div>

                  <div class="exercise-note" [class.has-note]="exerciseNotes()[state.exercise.id]">
                    <textarea
                      #noteArea
                      [value]="exerciseNotes()[state.exercise.id] ?? ''"
                      (input)="onNoteInput($event, state.exercise.id)"
                      (blur)="onNoteBlur(state.exercise.id, $event)"
                      (focus)="adjustTextareaHeight(noteArea)"
                      placeholder="Sensaciones, notas de este ejercicio..."
                      rows="1"
                      class="note-textarea"
                      [attr.aria-label]="'Nota del ejercicio ' + state.exercise.name"
                    ></textarea>
                    @if (exerciseNotes()[state.exercise.id]) {
                      <button class="clear-note" (click)="clearNote(state.exercise.id)" aria-label="Borrar nota">
                        ×
                      </button>
                    }
                  </div>
                </div>
              }

              @if (state.isActive && !state.isDone && !workoutStore.activeLog()?.completed) {
                <div class="set-logger-wrap">
                  <fc-set-logger
                    [setNumber]="state.completedSets.length + 1"
                    [exerciseId]="state.exercise.id"
                    [exerciseName]="state.exercise.name"
                    [previousSet]="lastSet(state)"
                    (setLogged)="onSetLogged($event, state.exercise)"
                  />
                </div>

                <div class="load-history-section">
                  <h4 class="load-history-title">📈 Histórico de Carga</h4>
                  <div class="load-history-cards">
                    @for (item of getLoadHistory(state.exercise.id); track item.date.getTime()) {
                      <div class="load-history-card">
                        <div class="lh-date">
                          <span class="lh-day">{{ item.date | date:'dd' }}</span>
                          <span class="lh-month">{{ item.date | date:'MMM' }}</span>
                        </div>
                        <div class="lh-metric">
                          <span class="lh-val">{{ item.maxWeight }}kg</span>
                          <span class="lh-lbl">Carga máx</span>
                        </div>
                        <div class="lh-metric">
                          <span class="lh-val">{{ item.setsCount }}</span>
                          <span class="lh-lbl">Series</span>
                        </div>
                        <div class="lh-metric">
                          <span class="lh-val">{{ item.volume }}</span>
                          <span class="lh-lbl">Volumen</span>
                        </div>
                      </div>
                    } @empty {
                      <p class="lh-empty">Sin entrenamientos anteriores de este ejercicio</p>
                    }
                  </div>
                </div>
              }

              @if (state.exercise.notes) {
                <p class="coach-note">{{ state.exercise.notes }}</p>
              }
            </div>
          }
        }
      </div>

      <!-- ── Banner completar ── -->
      @if ((allDone() || totalSets() > 0 || hasActiveNotes()) && !workoutStore.activeLog()?.completed) {
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

    @if (editingSet(); as set) {
      <div class="edit-overlay" (click)="editingSet.set(null)">
        <div class="edit-modal" (click)="$event.stopPropagation()">
          <header class="edit-header">
            <h3>Editar Serie {{ set.setNumber }}</h3>
            <p>{{ set.exerciseName }}</p>
          </header>
          
          <div class="edit-body">
            <div class="edit-field">
              <label>Peso (kg)</label>
              <div class="edit-stepper">
                <button (click)="adjustEditWeight(-0.5)">−</button>
                <input
                  type="number"
                  step="0.5"
                  inputmode="decimal"
                  [ngModel]="editWeight()"
                  (ngModelChange)="editWeight.set(+$event)"
                >
                <button (click)="adjustEditWeight(0.5)">+</button>
              </div>
            </div>
            
            <div class="edit-field">
              <label>Reps</label>
              <div class="edit-stepper">
                <button (click)="adjustEditReps(-1)">−</button>
                <input
                  type="number"
                  [ngModel]="editReps()"
                  (ngModelChange)="editReps.set(+$event)"
                >
                <button (click)="adjustEditReps(1)">+</button>
              </div>
            </div>
          </div>

          <div class="edit-footer">
            <button class="btn-delete" (click)="deleteSet(set)" title="Eliminar serie">
              🗑️
            </button>
            <div class="footer-main-btns">
              <button class="btn-cancel" (click)="editingSet.set(null)">Cancelar</button>
              <button class="btn-save" (click)="saveEdit(set)">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Capa 3: Modal de bloqueo remoto (Grace Period) -->
    @if (isDayBlockedRemotely()) {
      <div class="remote-block-overlay">
        <div class="remote-block-modal">
          <div class="modal-icon">🔒</div>
          <h2>Entrenamiento Finalizado</h2>
          <p>Esta sesión ha sido marcada como completada desde otro dispositivo.</p>
          <div class="sets-summary">
            <span class="count">{{ workoutStore.activeLog()?.sets?.length || 0 }}</span>
            <span class="label">series registradas hoy</span>
          </div>
          <button class="btn-primary" (click)="router.navigate(['/client/progress'])">
            Ver mi progreso
          </button>
        </div>
      </div>
    }
  `,
  styleUrls: ['./today-workout.component.css']
})
export class TodayWorkoutComponent implements OnInit, OnDestroy {
  private sb = supabase;
  workoutStore = inject(WorkoutStore);
  clientRoutineSvc = inject(ClientRoutineService);
  auth         = inject(AuthService);
  timer        = inject(RestTimerService);
  haptic       = inject(HapticService);
  router       = inject(Router);
  syncQueue    = inject(SyncQueueService);
  private telemetry    = inject(TelemetryService);
  private route = inject(ActivatedRoute);


  isLoading = signal(true);
  activeExerciseIndex = signal(0);
  activeRoutine = signal<AssignedRoutine | null>(null);
  selectedDayId = signal<string | null>(null);
  isDayDone     = signal(false);
  isDayBlockedRemotely = signal(false);
  editingSet    = signal<SetLog | null>(null);
  private completedDaysSub?: RealtimeChannel;
  
  // Señales auxiliares para el formulario de edición
  editWeight    = signal(0);
  editReps      = signal(10);

  // Map de notas por exerciseId (en memoria durante el workout)
  exerciseNotes = signal<Record<string, string | undefined>>({});

  protected Math = Math;

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

    // Sincronizar notas locales desde la sesión recuperada
    effect(() => {
      const log = this.workoutStore.activeLog();
      if (log) {
        const currentNotes = this.exerciseNotes();
        const newNotes: Record<string, string | undefined> = { ...currentNotes };
        let changed = false;

        // Cargar desde exerciseNotes si existe en la sesión persistida
        if (log.exerciseNotes) {
          Object.entries(log.exerciseNotes).forEach(([exId, val]) => {
            if (val !== newNotes[exId]) {
              newNotes[exId] = val;
              changed = true;
            }
          });
        }

        // Fallback a series para retrocompatibilidad
        log.sets.forEach(s => {
          if (s.notes !== undefined && s.notes !== null && s.notes !== newNotes[s.exerciseId]) {
            newNotes[s.exerciseId] = s.notes;
            changed = true;
          }
        });

        if (changed) {
          this.exerciseNotes.set(newNotes);
        }
      }
    }, { allowSignalWrites: true });
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
      const isDone = completedSets.length >= (Number(exercise.sets) || 0);
      return {
        exercise,
        completedSets,
        isActive: i === this.activeExerciseIndex(),
        isDone
      };
    });
  });

  completedExercises = computed(() =>
    this.exerciseStates().filter(s => s.isDone).length
  );

  overallProgress = computed(() => {
    const states = this.exerciseStates();
    if (!states.length) return 0;
    const totalSets    = states.reduce((s, e) => s + Number(e.exercise.sets || 0), 0);
    const completedSets = states.reduce((s, e) => s + e.completedSets.length, 0);
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  });

  allDone = computed(() =>
    this.exerciseStates().length > 0 &&
    this.exerciseStates().every(s => s.isDone)
  );

  hasActiveNotes = computed(() =>
    Object.values(this.exerciseNotes()).some(note => note && note.trim() !== '')
  );

  totalSets = computed(() =>
    this.workoutStore.activeLog()?.sets.length ?? 0
  );

  totalVolume = computed(() =>
    (this.workoutStore.activeLog()?.sets ?? [])
      .reduce((sum, s) => sum + s.weightKg * s.repsDone, 0)
  );

  async ngOnInit(): Promise<void> {
    console.log('[TodayWorkout] ngOnInit INICIO');
    
    // Si no hay perfil, esperamos a que el Signal lo tenga (reactivo)
    const profile = this.auth.profile();
    if (!profile) {
      console.log('[TodayWorkout] Esperando a que cargue el perfil...');
      const sub = toObservable(this.auth.profile).subscribe(p => {
        if (p) {
          console.log('[TodayWorkout] Perfil cargado diferido. Iniciando...');
          this.initWorkout(p.id);
          sub.unsubscribe();
        }
      });
    } else {
      this.initWorkout(profile.id);
    }
  }

  private async initWorkout(clientId: string) {
    console.log('[TodayWorkout] initWorkout para:', clientId);
    this.selectedDayId.set(this.route.snapshot.queryParams['dayId'] ?? null);

    try {
      const assigned = await this.clientRoutineSvc.getActiveRoutine(clientId);
      this.activeRoutine.set(assigned);
      console.log('[TodayWorkout] Rutina activa cargada:', assigned?.id);

      await this.workoutStore.loadHistory(clientId);

      if (assigned) {
        const day = this.todayDay();
        if (day) {
          console.log('[TodayWorkout] Evaluando día:', day.id);
          const isDone = await this.workoutStore.isDayCompleted(clientId, day.id);
          
          if (isDone) {
            this.isDayDone.set(true);
            this.isLoading.set(false);
            console.log('[TodayWorkout] El día ya consta como completado. Bloqueando sesión.');
            return; // Detener inicialización si ya está hecho
          } else {
            console.log('[TodayWorkout] Iniciando nueva sesión de entrenamiento...');
            this.workoutStore.startWorkout(assigned.id, assigned.routineId, clientId, day.id);
            this.subscribeToDayCompletion(clientId, day.id);
          }
        }
      }
    } catch (err) {
      console.error('[TodayWorkout] Error crítico en inicialización:', err);
    } finally {
      this.isLoading.set(false);
      console.log('[TodayWorkout] ngOnInit FINALIZADO (loading: false)');
    }
  }

  private subscribeToDayCompletion(clientId: string, dayId: string) {
    this.completedDaysSub = this.sb
      .channel('day-completion')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completed_days',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          if (payload.new['day_id'] === dayId) {
            console.log('[TodayWorkout] Realtime: día completado remotamente detectado.');
            this.isDayBlockedRemotely.set(true);
            this.haptic.trigger('heavy');
          }
        }
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.timer.stop();
    this.completedDaysSub?.unsubscribe();
  }

  isExerciseDone(state: ExerciseState): boolean {
    const actualLength = state.completedSets.length;
    const targetSets   = Number(state.exercise.sets) || 0;
    return actualLength >= targetSets;
  }

  lastSet(state: ExerciseState): SetLog | null {
    const sessionLast = state.completedSets[state.completedSets.length - 1];
    if (sessionLast) return sessionLast;
    // Si es la primera serie de la sesión, buscamos en el historial
    return this.workoutStore.getLastPerformance(state.exercise.id, state.exercise.name);
  }

  getLoadHistory(exerciseId: string) {
    const state = this.exerciseStates().find(s => s.exercise.id === exerciseId);
    const exerciseName = state?.exercise.name;
    if (!exerciseName) return [];

    const name = exerciseName.trim().toLowerCase();
    const history = this.workoutStore.history();
    const result: { date: Date; maxWeight: number; setsCount: number; volume: number }[] = [];

    for (const log of history) {
      const exerciseSets = log.sets.filter(s => 
        s.exerciseId === exerciseId || 
        s.exerciseName.trim().toLowerCase() === name
      );
      if (exerciseSets.length > 0) {
        const maxWeight = Math.max(...exerciseSets.map(s => s.weightKg ?? 0));
        const volume = exerciseSets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.repsDone ?? 0), 0);
        const dateObj = log.loggedDate instanceof Date ? log.loggedDate : new Date(log.loggedDate);
        result.push({
          date: dateObj,
          maxWeight,
          setsCount: exerciseSets.length,
          volume
        });
      }
    }
    return result.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
  }

  setActiveExercise(index: number): void {
    this.activeExerciseIndex.set(index);
  }

  setsForExercise(exerciseId: string) {
    return (this.workoutStore.activeLog()?.sets ?? []).filter(s => s.exerciseId === exerciseId);
  }

  async onSetLogged(
    set: Omit<SetLog, 'id'>,
    exercise: Exercise
  ): Promise<void> {
    console.log('[TodayWorkout] Recibida serie para:', exercise.name, set);
    try {
      await this.workoutStore.logSet(set);
    } catch (err) {
      if (err instanceof WorkoutBlockedError) {
        this.isDayBlockedRemotely.set(true);
        // ✅ Limpieza controlada de UI y persistencia local
        sessionStorage.removeItem('active_workout');
        this.workoutStore.clearActiveLog();
        return;
      }
      throw err;
    }
    this.haptic.trigger('light');

    const completed = this.setsForExercise(exercise.id).length + 1;
    const target = Number(exercise.sets) || 0;

    // Feedback visual y hático al terminar series
    if (completed >= target) {
      this.haptic.trigger('heavy');
    }
    
    // El descanso se inicia siempre para mantener el ritmo, pero NO avanzamos
    if (exercise.restSeconds > 0) {
      this.timer.start(exercise.restSeconds);
    }

    // Telemetry
    this.telemetry.track('set_saved', {
      exercise_id: exercise.id,
      weight: set.weightKg,
      reps: set.repsDone,
      input_method: 'quick-log' // Asumimos quick-log en esta vista
    });
  }


  editSet(set: SetLog): void {
    console.log('[FIX-EDIT] Abriendo modal para:', set.id);
    this.editWeight.set(set.weightKg);
    this.editReps.set(set.repsDone);
    this.editingSet.set({ ...set });
    this.haptic.trigger('light');
  }

  adjustEditWeight(delta: number): void {
    const next = Math.round((this.editWeight() + delta) * 10) / 10;
    this.editWeight.set(Math.max(0, next));
    this.haptic.trigger('light');
  }

  adjustEditReps(delta: number): void {
    this.editReps.set(Math.max(1, this.editReps() + delta));
    this.haptic.trigger('light');
  }

  saveEdit(originalSet: SetLog): void {
    console.log('[FIX-EDIT] Guardando cambios:', { 
      id: originalSet.id, 
      weight: this.editWeight(), 
      reps: this.editReps() 
    });
    
    this.workoutStore.updateSet(
      originalSet.id, 
      this.editWeight(), 
      this.editReps()
    );
    this.editingSet.set(null);
    this.haptic.trigger('medium');
  }

  deleteSet(set: SetLog): void {
    console.log('[TodayWorkout] Ejecutando deleteSet para ID:', set.id);
    this.workoutStore.removeSet(set.id);
    this.editingSet.set(null);
    this.haptic.trigger('heavy');
  }

  async completeWorkout(): Promise<void> {
    const label = this.todayDay()?.label || 'Entrenamiento';
    this.haptic.trigger('complete');
    
    // Antes de finalizar, para cada ejercicio que tenga una nota pero 0 series completadas,
    // registramos una serie ficticia (peso 0, reps 0) con el comentario en el store.
    // De este modo se enviará a Supabase y el coach verá la nota del ejercicio que "no le gustó" o "quiso comentar".
    const notes = this.exerciseNotes();
    const log = this.workoutStore.activeLog();
    if (log) {
      const dummySetPromises = Object.entries(notes)
        .filter(([_, note]) => note && note.trim() !== '')
        .map(async ([exId, note]) => {
          const completed = this.setsForExercise(exId);
          if (completed.length === 0) {
            const exState = this.exerciseStates().find(s => s.exercise.id === exId);
            const name = exState?.exercise.name || 'Ejercicio';
            await this.workoutStore.logSet({
              exerciseId: exId,
              exerciseName: name,
              setNumber: 1,
              weightKg: 0,
              repsDone: 0,
              completedAt: new Date(),
              notes: note
            });
          }
        });
      await Promise.all(dummySetPromises);
    }

    // Telemetry antes del redirect
    this.telemetry.track('workout_completed', {
      label: label,
      total_sets: this.totalSets(),
      total_volume: this.totalVolume()
    });

    await this.workoutStore.completeWorkout(label);
    this.router.navigate(['/client/progress']);
  }

  toggleFeeling(exerciseId: string, type: 'like' | 'dislike'): void {
    this.haptic.trigger('light');
    const currentNote = this.exerciseNotes()[exerciseId] ?? '';
    
    // Quitar cualquier prefijo de sentimiento anterior para no duplicar ni mezclar
    let cleanNote = currentNote
      .replace(/^👍 Me ha gustado:\s*/i, '')
      .replace(/^👎 No me ha gustado:\s*/i, '')
      .replace(/^👍 Me gusta:\s*/i, '')
      .replace(/^👎 No me gusta:\s*/i, '')
      .replace(/^👍\s*/, '')
      .replace(/^👎\s*/, '')
      .trim();

    let newNote = '';
    const isCurrentlyType = type === 'like' ? currentNote.startsWith('👍') : currentNote.startsWith('👎');

    if (!isCurrentlyType) {
      if (type === 'like') {
        newNote = cleanNote ? `👍 Me ha gustado: ${cleanNote}` : `👍 Me ha gustado`;
      } else {
        newNote = cleanNote ? `👎 No me ha gustado: ${cleanNote}` : `👎 No me ha gustado`;
      }
    } else {
      newNote = cleanNote; // Se deselecciona el sentimiento
    }

    this.exerciseNotes.update(notes => ({ ...notes, [exerciseId]: newNote }));
    this.workoutStore.updateExerciseNote(exerciseId, newNote);
  }

  onNoteInput(event: Event, exerciseId: string): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;

    this.exerciseNotes.update(notes => ({ ...notes, [exerciseId]: value }));
    this.adjustTextareaHeight(textarea);
  }

  onNoteBlur(exerciseId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value.trim();
    this.workoutStore.updateExerciseNote(exerciseId, value);
  }

  adjustTextareaHeight(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  clearNote(exerciseId: string): void {
    this.exerciseNotes.update(notes => {
      const updated = { ...notes };
      delete updated[exerciseId];
      return updated;
    });
    this.workoutStore.updateExerciseNote(exerciseId, '');
  }

  confirmExit(): void {
    if (this.totalSets() > 0 && !this.allDone()) {
      if (!confirm('¿Salir? El progreso de esta sesión se perderá.')) return;
    }
    this.router.navigate(['/client/dashboard']);
  }
}
