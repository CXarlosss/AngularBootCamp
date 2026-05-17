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
import { supabase } from '../../../core/supabase.client';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MissionCardComponent, ProfileBannerComponent],
  styleUrl: './client-dashboard.component.css',
  template: `
    <div class="client-dash">
      
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

      @if (activeRoutine(); as r) {
        <div class="routine-card">
          <div class="routine-info">
            <span class="routine-label">Rutina activa</span>
            <h2 class="routine-name">{{ r.routine?.name }}</h2>
          </div>
          <div class="days-list">
            @for (day of r.routine?.days || []; track day.id) {
              <div 
                class="day-chip"
                [class.done]="isDayDone(day.id)"
                [class.today]="isTodayDay(day)"
                (click)="goToWorkout(day.id)">
                <span class="day-label">{{ day.label }}</span>
                @if (isDayDone(day.id)) {
                  <span class="day-check">✓</span>
                }
              </div>
            }
          </div>
          <button class="btn-train" (click)="goToWorkout(null)">
            Continuar entrenamiento →
          </button>
        </div>
      }

      @if (gamificationEnabled()) {
        <div class="missions-panel">
          <div class="panel-header">
            <h3>Misiones Semanales</h3>
            <span class="xp-available">{{ totalAvailableXp() }} XP disponible</span>
          </div>
          @for (mission of activeMissions(); track mission.id) {
            <app-mission-card [mission]="mission" (onClaim)="claimMission($event)" />
          }
        </div>
      }

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
  private router = inject(Router);
  
  protected profile = this.auth.profile;
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected totalAvailableXp = this.missionEngine.totalXpAvailable;
  protected streak = signal<any>(null);
  protected leaderboardTop3 = signal<any[]>([]);
  
  activeRoutine = signal<any>(null);
  completedDayIds = signal<string[]>([]);
  
  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
      this.loadDashboardData(userId);
      this.rankSvc.load(userId);
      this.loadRoutine(userId); // añadir esta línea
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
  
  async claimMission(missionId: string): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    await this.missionEngine.claimXp(userId, missionId);
    // Recargar
    await this.loadDashboardData(userId);
  }
  
  protected streakWeeks = computed(() => {
    // Array de 8 semanas para visualización
    const streak = this.streak()?.currentStreak || 0;
    return Array(8).fill(false).map((_, i) => i < streak);
  });
  
  private async loadRoutine(clientId: string) {
    const { data } = await supabase
      .from('assigned_routines')
      .select('*, routine:routines(*, days:routine_days(*, exercises:routine_exercises(*)))')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .maybeSingle();
    this.activeRoutine.set(data);

    const { data: completed } = await supabase
      .from('completed_days')
      .select('day_id')
      .eq('client_id', clientId);
    this.completedDayIds.set((completed || []).map((c: any) => c.day_id));
  }

  isDayDone(dayId: string): boolean {
    return this.completedDayIds().includes(dayId);
  }

  isTodayDay(day: any): boolean {
    const jsDay = new Date().getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;
    return day.dayNumber === isoDay;
  }

  goToWorkout(dayId: string | null) {
    const params = dayId ? { queryParams: { dayId } } : {};
    this.router.navigate(['/client/workout'], params);
  }
}
