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
import { AvatarFrameComponent } from '../../../shared/components/avatar-frame/avatar-frame.component';
import { InitialsPipe }         from '../../../shared/pipes/initials.pipe';
import { RankService }          from '../../../core/services/rank.service';
import { RouterModule }         from '@angular/router';
import { BANNER_COLORS, BANNER_PATTERNS } from '../profile/profile-banner/banner.types';
import { ProfileBannerComponent } from '../profile/profile-banner/profile-banner.component';

@Component({
  selector: 'fc-client-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RankCardComponent, AvatarFrameComponent, InitialsPipe, RouterModule, ProfileBannerComponent],
  template: `
    <div class="client-dash">

      <header class="client-header">
        <div class="header-logo">Fit<span>Coach</span></div>
      </header>

      <div class="dashboard-banner-wrapper">
        <app-profile-banner [useCurrentUser]="true" size="lg" />
        <a class="cd-edit-btn banner-edit-btn" routerLink="/client/profile/banner">
          🎨 Personalizar
        </a>
      </div>

      <!-- SISTEMA DE RANGOS -->
      <div class="dash-rank-section" style="margin: 0 16px 20px;">
        <app-rank-card />
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
  rankSvc = inject(RankService);
  private clientRoutineSvc = inject(ClientRoutineService);

  profile = computed(() => this.profileSvc.profile());
  userName = computed(() => this.profile()?.full_name || 'Atleta');
  bannerColor = computed(() => this.profile()?.banner_color || 'c0');
  bannerPattern = computed(() => this.profile()?.banner_pattern || 'p0');
  specialFrame = computed(() => this.profile()?.equipped_frame || null);
  totalXp = computed(() => this.rankSvc.athleteRank()?.xpTotal ?? 0);
  currentRank = computed(() => this.rankSvc.fullRank()?.rank ?? null);
  currentDivision = computed(() => this.rankSvc.fullRank()?.divLabel ?? 'IV');

  bannerGradient = computed(() => {
    const color = BANNER_COLORS.find(c => c.id === this.bannerColor()) || BANNER_COLORS[0];
    return color.gradient;
  });

  patternClass = computed(() => {
    const pattern = BANNER_PATTERNS.find(p => p.id === this.bannerPattern()) || BANNER_PATTERNS[0];
    return `cd-banner-pattern ${pattern.cssClass}`;
  });

  rankFrameColor = computed(() => this.rankSvc.fullRank()?.rank?.color ?? 'transparent');
  rankBadgeBg = computed(() => this.rankSvc.fullRank() ? `${this.rankSvc.fullRank()!.rank.color}33` : 'rgba(255,255,255,0.1)');

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
        this.workoutStore.loadHistory(clientId),
        this.profileSvc.load()
      ]);
      
      this.routine.set(assigned);

      if (assigned) {
        const completedDays = await this.clientRoutineSvc.getCompletedDays(clientId, assigned.routineId);
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
