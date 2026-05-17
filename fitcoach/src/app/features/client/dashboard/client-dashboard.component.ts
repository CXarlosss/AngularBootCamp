// src/app/features/client/dashboard/client-dashboard.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MissionEngineService } from '../../gamification/services/mission-engine.service';
import { StreakWeeklyService } from '../../gamification/services/streak-weekly.service';
import { LeaderboardService } from '../../gamification/services/leaderboard.service';
import { MissionCardComponent } from '../../gamification/components/mission-card/mission-card.component';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { ProfileBannerComponent } from '../profile/profile-banner/profile-banner.component';
import { AuthService } from '../../../core/auth/auth.service';
import { RankService } from '../../../core/services/rank.service';
import { ClientRoutineService } from '../../../core/services/client-routine.service';
import { WorkoutStore } from '../../../state/workout.store';
import { ProfileService } from '../profile/profile.service';
import { AssignedRoutine } from '../../../core/models/routine.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MissionCardComponent, ProfileBannerComponent],
  template: `
    <div class="client-dash">
      <!-- Banner de identidad con saludo integrado -->
      @if (profile(); as p) {
        <app-profile-banner
          [name]="'Hola, ' + (p.fullName || 'Atleta')"
          [initials]="p.fullName?.slice(0,2) || 'AT'"
          [rankLevel]="rankSvc.fullRank()?.rank?.level || 0"
          [rankName]="rankSvc.fullRank()?.rank?.name || 'Recruta'"
          [rankEmoji]="rankSvc.fullRank()?.rank?.emoji || '⚔️'"
          [divLabel]="rankSvc.fullRank()?.divLabel || 'IV'"
          [xpTotal]="rankSvc.athleteRank()?.xpTotal || 0"
          [equippedFrame]="p.equippedFrame || null"
          [bannerColor]="p.bannerColor || 'c0'"
          [bannerPattern]="p.bannerPattern || 'p0'"
        />
      }
      
      <!-- Sprint 3: Misiones -->
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
      
      <!-- Sprint 3: Racha -->
      @if (gamificationEnabled() && streak(); as s) {
        <div class="streak-card" [class.on-fire]="s.currentStreak >= 4">
          <div class="streak-visual">
            @for (week of streakWeeks(); track $index) {
              <div class="week-pip" [class.active]="week"></div>
            }
          </div>
          <div class="streak-text">
            <span class="count">{{ s.currentStreak }} semanas seguidas</span>
            <span class="target">{{ s.daysCompleted }}/{{ s.targetDays }} días esta semana</span>
          </div>
        </div>
      }
      
      <!-- Sprint 3: Leaderboard (top 3) -->
      @if (gamificationEnabled() && leaderboardTop3().length > 0) {
        <div class="leaderboard-preview">
          <h4>Top de tu grupo</h4>
          @for (entry of leaderboardTop3(); track entry.clientId) {
            <div class="leader-row" [class.me]="entry.isCurrentUser">
              <span class="rank">{{ entry.rank }}</span>
              <span class="name">{{ entry.clientName }}</span>
              <span class="value">{{ entry.value }} XP</span>
            </div>
          }
        </div>
      }
      
      <!-- Resto del dashboard existente: Rutina activa -->
      @if (routine(); as r) {
        <div class="routine-card">
          <div class="rc-header">
            <div class="rc-badge">Rutina activa</div>
            <span class="rc-arrow">›</span>
          </div>
          <h2 class="rc-name">{{ r.routine?.name }}</h2>
          <p class="rc-meta">
            {{ r.routine?.days?.length }} días ·
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
      } @else if (!isLoading()) {
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
  `
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
  private router = inject(Router);
  
  protected profile = this.auth.profile;
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected totalAvailableXp = this.missionEngine.totalXpAvailable;
  protected streak = signal<any>(null);
  protected leaderboardTop3 = signal<any[]>([]);
  
  protected routine = signal<AssignedRoutine | null>(null);
  protected completedDaysList = signal<string[]>([]);
  protected isLoading = signal(true);
  
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
  
  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
      this.loadDashboardData(userId);
      this.rankSvc.load(userId);
      this.loadRoutineData(userId);
    }
  }
  
  async loadDashboardData(clientId: string): Promise<void> {
    // Misiones
    await this.missionEngine.loadMissions(clientId);
    
    // Racha
    const streakData = await this.streakService.calculateStreak(clientId);
    this.streak.set(streakData);
    
    // Leaderboard (top 3)
    const board = await this.leaderboard.getLeaderboard('coach-id', 'xp');
    this.leaderboardTop3.set(board.slice(0, 3));
  }
  
  async loadRoutineData(clientId: string): Promise<void> {
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
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando rutina:', err);
    } finally {
      this.isLoading.set(false);
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
    }
  }
  
  protected goalLabel = (goal?: string) => ({
    hypertrophy:  'Hipertrofia',
    strength:     'Fuerza',
    weight_loss:  'Pérdida de peso',
    mobility:     'Movilidad',
  }[goal ?? ''] ?? goal ?? '');
  
  protected streakWeeks = computed(() => {
    // Array de 8 semanas para visualización
    const streak = this.streak()?.currentStreak || 0;
    return Array(8).fill(false).map((_, i) => i < streak);
  });
}
