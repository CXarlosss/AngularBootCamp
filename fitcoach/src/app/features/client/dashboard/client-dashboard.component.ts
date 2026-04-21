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
import { computed }             from '@angular/core';

@Component({
  selector: 'fc-client-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="client-dash">

      <header class="client-header">
        <div class="header-logo">Fit<span>Coach</span></div>
        <div class="header-av">{{ initials(auth.profile()?.fullName ?? '') }}</div>
      </header>

      <div class="greeting">
        <h1 class="greeting-name">{{ greeting() }}, {{ firstName() }}</h1>
        <p class="greeting-sub">
          @if (routine()) { 
            @if (visibleDays().length > 0) { Tienes trabajo pendiente esta semana }
            @else { ¡Has completado todos los entrenamientos de esta rutina! 🚀 }
          }
          @else { Tu entrenador aún no te ha asignado una rutina }
        </p>
      </div>

      @if (routine(); as r) {
        <div class="routine-card">
          <div class="rc-header">
            <div class="rc-badge">Rutina activa</div>
            <span class="rc-total">{{ visibleDays().length }} / {{ r.routine?.days?.length }} restantes</span>
          </div>
          <h2 class="rc-name">{{ r.routine?.name }}</h2>
          <p class="rc-meta">
            {{ r.routine?.goal ? goalLabel(r.routine.goal) : '' }}
          </p>
          
          <div class="rc-days">
            @for (day of visibleDays(); track day.id) {
              <div class="day-chip interactive" (click)="startWorkout(day.id)">
                <span class="day-label">{{ day.label }}</span>
                <span class="day-count">{{ day.exercises.length }} ejercicios</span>
              </div>
            }

            @if (visibleDays().length === 0) {
              <div class="all-done-msg">
                💪 Todo completado por ahora. ¡Buen trabajo!
              </div>
            }
          </div>

          @if (visibleDays().length > 0) {
            <button class="btn-start" (click)="startWorkout(visibleDays()[0].id)">
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

      <nav class="bottom-nav">
        <button class="nav-btn active" (click)="router.navigate(['/client/dashboard'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Inicio</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/workout'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4"/>
          </svg>
          <span>Entreno</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/progress'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <span>Progreso</span>
        </button>
        <button class="nav-btn" (click)="router.navigate(['/client/chat'])">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Chat</span>
        </button>
      </nav>

    </div>
  `,
  styleUrl: './client-dashboard.component.css',
})
export class ClientDashboardComponent implements OnInit {
  auth    = inject(AuthService);
  router  = inject(Router);
  workoutStore = inject(WorkoutStore);
  private clientRoutineSvc = inject(ClientRoutineService);

  routine = signal<AssignedRoutine | null>(null);

  visibleDays = computed(() => {
    const r = this.routine();
    const history = this.workoutStore.history();
    if (!r || !r.routine?.days) return [];

    // Filtramos los días que ya tienen un log completado para ESTA asignación específica
    return r.routine.days.filter(day => {
      const isCompleted = history.some(log => 
        log.assignedRoutineId === r.id && 
        log.dayId === day.id &&
        log.completed
      );
      return !isCompleted;
    });
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

  private async loadData(clientId: string) {
    console.log('[Dashboard] Cargando datos para:', clientId);
    const [r] = await Promise.all([
      this.clientRoutineSvc.getActiveRoutine(clientId),
      this.workoutStore.loadHistory(clientId)
    ]);
    this.routine.set(r);
  }

  startWorkout(dayId?: string): void {
    if (dayId) {
      this.router.navigate(['/client/workout'], { queryParams: { dayId } });
    } else {
      this.router.navigate(['/client/workout']);
    }
  }
}
