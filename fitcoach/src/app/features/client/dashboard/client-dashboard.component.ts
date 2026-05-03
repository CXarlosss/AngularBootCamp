import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService }         from '../../../core/auth/auth.service';
import { ClientRoutineService } from '../../../core/services/client-routine.service';
import { AssignedRoutine }      from '../../../core/models/routine.model';
import { WorkoutStore }         from '../../../state/workout.store';
import { ProfileService }       from '../profile/profile.service';
import { computed }             from '@angular/core';
import { RankCardComponent }    from '../../../shared/components/rank-card/rank-card.component';

@Component({
  selector: 'fc-client-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RankCardComponent],
  template: `
    <div class="client-dash">

      <header class="client-header">
        <div class="header-logo">Fit<span>Coach</span></div>
        <div class="header-av">{{ initials(auth.profile()?.fullName ?? '') }}</div>
      </header>

      @if (profileSvc.profile(); as p) {
        <div class="profile-banner" (click)="router.navigate(['/profile'])">
          <div class="profile-avatar">{{ p.full_name[0] }}</div>
          <div class="profile-info">
            <span class="profile-name">{{ p.full_name }}</span>
            <span class="profile-meta">
              {{ profileSvc.goalEmoji(p.goal) }} {{ profileSvc.goalLabel(p.goal) }}
              @if (profileSvc.age(p)) { · {{ profileSvc.age(p) }} años }
            </span>
          </div>
        </div>
      }

      <!-- SISTEMA DE RANGOS -->
      <div class="dash-rank-section" style="margin: 0 16px 20px;">
        <app-rank-card />
      </div>

      <div class="greeting">
        <h1 class="greeting-name">{{ greeting() }}, {{ firstName() }}</h1>
        <p class="greeting-sub">
          @if (routine()) { 
            @if (pendingDaysCount() > 0) { Tienes trabajo pendiente esta semana }
            @else { ¡Has completado todos los entrenamientos de esta rutina! 🚀 }
          }
          @else { Tu entrenador aún no te ha asignado una rutina }
        </p>
      </div>

      @if (routine(); as r) {
        <div class="routine-card">
          <div class="rc-header">
            <div class="rc-badge">Rutina activa</div>
            <span class="rc-total">{{ pendingDaysCount() }} / {{ r.routine?.days?.length }} pendientes</span>
          </div>
          <h2 class="rc-name">{{ r.routine?.name }}</h2>
          <p class="rc-meta">
            {{ r.routine?.goal ? goalLabel(r.routine!.goal!) : '' }}
          </p>
          
          <div class="rc-days">
            @for (day of routineDaysStatus(); track day.id) {
              <div 
                class="day-chip interactive" 
                [class.done]="day.isCompleted"
                (click)="!day.isCompleted && startWorkout(day.id)"
              >
                <span class="day-label">{{ day.label }}</span>
                @if (day.isCompleted) {
                  <span class="day-count">✓ Completado</span>
                } @else {
                  <span class="day-count">{{ day.exercises.length }} ejercicios</span>
                }
              </div>
            }

            @if (pendingDaysCount() === 0) {
              <div class="all-done-msg">
                ¡Semana completada! Tu coach te asignará una nueva rutina pronto.
              </div>
            }
          </div>

          @if (pendingDaysCount() > 0) {
            <button class="btn-start" (click)="startFirstPendingWorkout()">
              Continuar entrenamiento
            </button>
          }
        </div>
      } @else {
        <div class="empty-card">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <p class="empty-title">Sin rutina asignada</p>
          <p class="empty-sub">Tu entrenador te enviará una rutina pronto</p>
        </div>
      }
    </div>
  `,
  styleUrl: './client-dashboard.component.css',
})
export class ClientDashboardComponent implements OnInit {
  auth    = inject(AuthService);
  router  = inject(Router);
  workoutStore = inject(WorkoutStore);
  profileSvc = inject(ProfileService);
  private clientRoutineSvc = inject(ClientRoutineService);

  routine = signal<AssignedRoutine | null>(null);
  completedDaysList = signal<string[]>([]);

  routineDaysStatus = computed(() => {
    const r = this.routine();
    const history = this.workoutStore.history();
    const dbCompleted = this.completedDaysList();
    if (!r || !r.routine?.days) return [];

    return r.routine.days.map(day => {
      const isCompletedInHistory = history.some(log => 
        log.assignedRoutineId === r.id && 
        log.dayId === day.id &&
        log.completed
      );
      const isCompletedInDB = dbCompleted.includes(day.id);
      
      return {
        ...day,
        isCompleted: isCompletedInHistory || isCompletedInDB
      };
    });
  });

  pendingDaysCount = computed(() => {
    return this.routineDaysStatus().filter(d => !d.isCompleted).length;
  });

  greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  firstName = () =>
    (this.auth.profile()?.fullName ?? 'atleta').split(' ')[0];

  initials = (name: string) =>
    name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  goalLabel = (goal?: string) => ({
    hypertrophy:  'Hipertrofia',
    strength:     'Fuerza',
    weight_loss:  'Pérdida de peso',
    mobility:     'Movilidad',
  }[goal ?? ''] ?? goal ?? '');

  async ngOnInit(): Promise<void> {
    const profile = this.auth.profile();
    if (profile?.id) {
      this.loadData(profile.id);
    } else {
      const sub = toObservable(this.auth.profile).subscribe(p => {
        if (p?.id) {
          this.loadData(p.id);
          sub.unsubscribe();
        }
      });
    }
  }

  isLoading = signal(true);

  private async loadData(clientId: string) {
    console.log('[Dashboard] Cargando datos para:', clientId);
    this.isLoading.set(true);
    try {
      const [assigned] = await Promise.all([
        this.clientRoutineSvc.getActiveRoutine(clientId),
        this.workoutStore.loadHistory(clientId)
      ]);
      
      this.routine.set(assigned);

      if (assigned) {
        const completedDays = await this.clientRoutineSvc.getCompletedDays(clientId, assigned.routineId);
        // Fix: completedDays ya es string[], no hace falta map d.day_id
        this.completedDaysList.set(completedDays);
        console.log('[Dashboard] Días completados cargados:', completedDays);
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando datos:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  startWorkout(dayId: string): void {
    console.log('[Dashboard] startWorkout click con dayId:', dayId);
    const day = this.routineDaysStatus().find(d => d.id === dayId);
    if (day?.isCompleted) {
      console.warn('[Dashboard] El día ya está completado, abortando navegación');
      return;
    }

    this.router.navigate(['/client/workout'], { 
      queryParams: { dayId } 
    }).then(nav => {
      console.log('[Dashboard] Navegación a workout exitosa:', nav);
    });
  }

  startFirstPendingWorkout(): void {
    const next = this.routineDaysStatus().find(d => !d.isCompleted);
    if (next) {
      this.startWorkout(next.id);
    }
  }
}
