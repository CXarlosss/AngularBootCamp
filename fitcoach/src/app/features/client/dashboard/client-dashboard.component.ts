// src/app/features/client/dashboard/client-dashboard.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

// Servicios de Core y Gamificación
import { RankService } from '../../../core/services/rank.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { UnlockCelebrationService } from '../../../shared/services/unlock-celebration/unlock-celebration.service';
import { RankChangeDetectorService } from '../../../core/services/rank-change-detector.service';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { MissionEngineService } from '../../gamification/services/mission-engine.service';
import { StreakWeeklyService } from '../../gamification/services/streak-weekly.service';
import { LeaderboardService } from '../../gamification/services/leaderboard.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClientRoutineService } from '../../../core/services/client-routine.service';
import { WorkoutStore } from '../../../state/workout.store';
import { ProfileService } from '../profile/profile.service';

// Tipos y Modelos
import { AssignedRoutine } from '../../../core/models/routine.model';
import { BANNER_COLORS, BANNER_PATTERNS } from '../profile/profile-banner/banner.types';

// Subcomponentes del Dashboard
import { NextGoalComponent } from './components/next-goal/next-goal.component';
import { RankProgressComponent } from '../rank/rank-progress/rank-progress.component';
import { StreakWidgetComponent } from './components/streak-widget/streak-widget.component';
import { QuickStatsComponent } from './components/quick-stats/quick-stats.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { MissionCardComponent } from '../../gamification/components/mission-card/mission-card.component';

@Component({
  selector: 'fc-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NextGoalComponent,
    RankProgressComponent,
    StreakWidgetComponent,
    QuickStatsComponent,
    RecentActivityComponent,
    MissionCardComponent
  ],
  template: `
    <div class="cd-page">
      
      <!-- ===== BANNER PERSONALIZADO (100% dinámico y conectado a Supabase) ===== -->
      @if (profile(); as p) {
        <div class="cd-banner" [style.background]="bannerGradient()">
          <div [class]="patternClass()"></div>
          
          <div class="cd-banner-content">
            <div class="cd-avatar-wrap">
              <div class="cd-avatar-ring" [style.border-color]="rankFrameColor()">
                <div class="cd-avatar">{{ initials() }}</div>
                @if (specialFrame()) {
                  <div class="cd-special-frame" [class]="'frame-' + specialFrame()"></div>
                }
              </div>
            </div>
            
            <div class="cd-banner-info">
              <h1 class="cd-name">{{ userName() }}</h1>
              <div class="cd-meta">
                <span class="cd-rank-badge" [style.background]="rankBadgeBg()">
                  {{ currentRank()?.emoji }} {{ currentRank()?.name }} {{ currentDivision() }}
                </span>
                <span class="cd-xp">⭐ {{ totalXp() | number }} XP</span>
              </div>
            </div>
            
            <a class="cd-edit-btn" routerLink="/client/profile/banner">
              🎨 Editar
            </a>
          </div>
        </div>
      }

      <!-- ===== GRID PRINCIPAL EN DOS COLUMNAS (Estilo Premium Sprint 4) ===== -->
      <div class="cd-grid">
        
        <!-- COLUMNA PRINCIPAL (60%): Rutina Activa, Próximo Objetivo, Misiones, Actividad -->
        <div class="cd-col-main">
          
          <!-- 🏋️ RUTINA ACTIVA (Core de FitCoach - Recuperado de Sprint 4) -->
          @if (routine(); as r) {
            <div class="routine-card">
              <div class="rc-header">
                <div class="rc-badge">Rutina activa</div>
                <span class="rc-arrow">›</span>
              </div>
              <h2 class="rc-name">{{ r.routine?.name }}</h2>
              <p class="rc-meta">
                {{ r.routine?.days?.length }} días asignados ·
                {{ goalLabel(r.routine?.goal) }}
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
                    🏆 ¡Todos los entrenamientos de esta rutina están completados! Tu coach te asignará un nuevo plan pronto.
                  </div>
                }
              </div>

              @if (pendingDaysCount() > 0) {
                <button class="btn-start" (click)="startFirstPendingWorkout()">
                  Continuar entrenamiento
                </button>
              }
            </div>
          } @else if (isLoading()) {
            <div class="routine-card" style="display: flex; justify-content: center; align-items: center; padding: 48px 24px;">
              <div class="loading-spinner" style="color: var(--c-green); font-size: 1.1rem; font-weight: 600;">
                Cargando tu plan de entrenamiento...
              </div>
            </div>
          } @else {
            <div class="empty-card">
              <div class="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
              </div>
              <p class="empty-title">Sin rutina activa</p>
              <p class="empty-sub">Tu entrenador personal te asignará una rutina a medida muy pronto.</p>
            </div>
          }

          <!-- 🎯 WIDGET: PRÓXIMO OBJETIVO -->
          <app-next-goal
            (onAction)="startFirstPendingWorkout()" />
          
          <!-- 🏅 MISIONES SEMANALES INTERACTIVAS (Gamificación V2) -->
          @if (gamificationEnabled()) {
            <div class="missions-panel">
              <div class="panel-header">
                <h3>Misiones Semanales</h3>
                <span class="xp-available">{{ totalAvailableXp() }} XP disponible</span>
              </div>
              @for (mission of activeMissions(); track mission.id) {
                <app-mission-card 
                  [mission]="mission"
                  (onClaim)="claimMission($event)" />
              }
            </div>
          }
          
          <!-- 📊 STATS RÁPIDOS ( workoutsThisWeek, streaks, records, ranking ) -->
          <app-quick-stats
            [workoutsThisWeek]="workoutsThisWeek()"
            [currentStreak]="currentStreak()"
            [personalRecords]="personalRecords()"
            [rankPosition]="rankPosition()" />
          
          <!-- 📅 HISTORIAL / ACTIVIDAD RECIENTE DINÁMICA -->
          <app-recent-activity [activities]="recentActivities()" />
          
        </div>

        <!-- COLUMNA LATERAL (40%): Racha, Camino al Olimpo, Personalización de estilo -->
        <div class="cd-col-side">
          
          <!-- 🔥 RACHA ACTIVA -->
          @if (gamificationEnabled() && streak(); as s) {
            <app-streak-widget
              [streakDays]="s.currentStreak"
              [bestStreak]="s.currentStreak"
              [isAtRisk]="streakAtRisk()"
              (onAction)="startFirstPendingWorkout()" />
          } @else if (gamificationEnabled()) {
            <app-streak-widget
              [streakDays]="0"
              [bestStreak]="0"
              [isAtRisk]="false"
              (onAction)="startFirstPendingWorkout()" />
          }
          
          <!-- 🏅 CAMINO AL OLIMPO (Progreso detallado del Rango) -->
          <div class="cd-rank-mini">
            <h3 class="cd-section-title">Tu camino al Olimpo</h3>
            <app-rank-progress
              [totalXp]="totalXp()"
              (onMotivate)="startFirstPendingWorkout()"
              (onShare)="shareProgress()" />
          </div>
          
          <!-- 🎨 PREVIEW DE TU ESTILO ACTUAL (Vínculo a personalización) -->
          <div class="cd-customize-cta">
            <h3 class="cd-section-title">Tu estilo</h3>
            <div class="cd-style-preview">
              <div class="cd-style-swatch" [style.background]="bannerGradient()"></div>
              <div class="cd-style-info">
                <p>{{ bannerColorName() }} + {{ bannerPatternName() }}</p>
                <a routerLink="/client/profile/banner">Personalizar →</a>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  `,
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  private featureFlags = inject(FeatureFlagService);
  private missionEngine = inject(MissionEngineService);
  private streakService = inject(StreakWeeklyService);
  private leaderboard = inject(LeaderboardService);
  private auth = inject(AuthService);
  protected rankSvc = inject(RankService);
  private clientRoutineSvc = inject(ClientRoutineService);
  private workoutStore = inject(WorkoutStore);
  private profileSvc = inject(ProfileService);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private celebration = inject(UnlockCelebrationService);
  private rankDetector = inject(RankChangeDetectorService);

  // Perfil del usuario autenticado
  protected profile = this.auth.profile;
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected totalAvailableXp = this.missionEngine.totalXpAvailable;
  
  // Lógica de rutina activa
  protected routine = signal<AssignedRoutine | null>(null);
  protected completedDaysList = signal<string[]>([]);
  protected isLoading = signal(true);

  // Racha y telemetría de gamificación
  protected streak = signal<any>(null);
  protected leaderboardTop3 = signal<any[]>([]);

  // Datos calculados del Perfil del Atleta
  userName = computed(() => this.profile()?.fullName || 'Atleta');
  initials = computed(() => this.profile()?.fullName?.slice(0, 2).toUpperCase() || 'AT');
  specialFrame = computed(() => this.profile()?.equippedFrame || null);
  bannerColor = computed(() => this.profile()?.bannerColor || 'c0');
  bannerPattern = computed(() => this.profile()?.bannerPattern || 'p0');

  // Cálculos de XP y Rangos
  totalXp = computed(() => this.rankSvc.athleteRank()?.xpTotal ?? 0);
  currentRank = computed(() => this.rankSvc.fullRank()?.rank ?? null);
  currentDivision = computed(() => this.rankSvc.fullRank()?.divLabel ?? 'IV');

  // Propiedades dinámicas del Banner
  bannerGradient = computed(() => {
    const colorId = this.bannerColor();
    const color = BANNER_COLORS.find(c => c.id === colorId) || BANNER_COLORS[0];
    return color.gradient;
  });

  bannerColorName = computed(() => {
    const colorId = this.bannerColor();
    const color = BANNER_COLORS.find(c => c.id === colorId) || BANNER_COLORS[0];
    return color.label;
  });

  bannerPatternName = computed(() => {
    const patternId = this.bannerPattern();
    const pattern = BANNER_PATTERNS.find(p => p.id === patternId) || BANNER_PATTERNS[0];
    return pattern.label;
  });

  patternClass = computed(() => {
    const patternId = this.bannerPattern();
    const pattern = BANNER_PATTERNS.find(p => p.id === patternId) || BANNER_PATTERNS[0];
    return `cd-banner-pattern ${pattern.cssClass}`;
  });

  rankFrameColor = computed(() => {
    const s = this.rankSvc.fullRank();
    return s?.rank.color ?? 'transparent';
  });

  rankBadgeBg = computed(() => {
    const s = this.rankSvc.fullRank();
    if (!s) return 'rgba(255,255,255,0.1)';
    return `${s.rank.color}33`; // 20% de opacidad del color de rango
  });

  // Métricas reactivas del Dashboard
  currentStreak = computed(() => this.streak()?.currentStreak ?? 0);
  bestStreak = computed(() => this.streak()?.currentStreak ?? 0);
  streakAtRisk = computed(() => this.streak()?.isAtRisk ?? false);
  personalRecords = signal(3);
  rankPosition = signal(42);

  // Calcula entrenamientos de la semana de forma dinámica desde el historial de workoutStore
  workoutsThisWeek = computed(() => {
    const history = this.workoutStore.history();
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    return history.filter(log => {
      const logDate = new Date(log.loggedDate);
      return logDate >= startOfWeek && log.completed;
    }).length;
  });

  // Genera actividades recientes basadas 100% en el historial real cargado desde Supabase
  recentActivities = computed(() => {
    const history = this.workoutStore.history();
    const list = history.map(log => {
      const date = new Date(log.loggedDate);
      const isToday = date.toDateString() === new Date().toDateString();
      const dateStr = isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return {
        type: 'workout',
        title: `Entrenamiento completado`,
        xp: 10 + log.sets.length,
        date: dateStr
      };
    });
    
    // Si no hay historial real, devolvemos un bonito placeholder de bienvenida
    if (list.length === 0) {
      return [
        { type: 'unlock', title: '¡Comienza tu viaje en FitCoach hoy!', date: 'Reciente' }
      ];
    }
    return list.slice(0, 4);
  });

  // Lógica de carga de entrenamientos
  protected routineDaysStatus = computed(() => {
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

  protected pendingDaysCount = computed(() => {
    return this.routineDaysStatus().filter(d => !d.isCompleted).length;
  });

  async ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
      this.isLoading.set(true);
      try {
        await Promise.all([
          this.loadDashboardData(userId),
          this.rankSvc.load(userId),
          this.loadRoutineData(userId)
        ]);
      } catch (err) {
        console.error('[Dashboard] Error inicializando:', err);
      } finally {
        this.isLoading.set(false);
      }
      this.rankDetector.initialize();
    }
  }

  async loadDashboardData(clientId: string): Promise<void> {
    try {
      // Misiones
      await this.missionEngine.loadMissions(clientId);
      
      // Racha
      const streakData = await this.streakService.calculateStreak(clientId);
      this.streak.set(streakData);
      
      // Leaderboard (Top 3)
      const board = await this.leaderboard.getLeaderboard('coach-id', 'xp');
      this.leaderboardTop3.set(board.slice(0, 3));
    } catch (e) {
      console.warn('[Dashboard] Error cargando datos de gamificación:', e);
    }
  }

  async loadRoutineData(clientId: string): Promise<void> {
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
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando rutina:', err);
    }
  }

  async claimMission(missionId: string): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    await this.missionEngine.claimXp(userId, missionId);
    // Recargar
    await this.loadDashboardData(userId);
  }

  startWorkout(dayId: string): void {
    const day = this.routineDaysStatus().find(d => d.id === dayId);
    if (day?.isCompleted) return;

    this.router.navigate(['/client/workout'], { 
      queryParams: { dayId } 
    });
  }

  startFirstPendingWorkout(): void {
    const next = this.routineDaysStatus().find(d => !d.isCompleted);
    if (next) {
      this.startWorkout(next.id);
    } else {
      this.toast.info('¡Todo completado!', 'Ya has terminado todos tus días de entrenamiento asignados.');
    }
  }

  protected goalLabel = (goal?: string) => ({
    hypertrophy:  'Hipertrofia',
    strength:     'Fuerza',
    weight_loss:  'Pérdida de peso',
    mobility:     'Movilidad',
  }[goal ?? ''] ?? goal ?? '');

  goToWorkout() {
    this.startFirstPendingWorkout();
  }

  shareProgress() {
    this.toast.success('¡Progreso copiado!', 'Listo para compartir en redes');
  }

  /**
   * TEST: Simular subida de rango (Solo para pruebas en local)
   */
  simulateRankUp() {
    const cur = this.rankSvc.athleteRank();
    if (!cur) return;
    
    // Añadimos XP suficiente para saltar a Legionario si estamos en Recruta
    this.rankSvc.addXP({ daysXp: 600, setsXp: 0, progressXp: 0 });
    this.toast.info('Simulando...', 'Añadiendo XP para forzar subida de rango');
  }
}
