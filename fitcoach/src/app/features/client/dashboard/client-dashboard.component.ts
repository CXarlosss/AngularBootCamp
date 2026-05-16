// src/app/features/client/dashboard/client-dashboard.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionEngineService } from '../../gamification/services/mission-engine.service';
import { StreakWeeklyService } from '../../gamification/services/streak-weekly.service';
import { LeaderboardService } from '../../gamification/services/leaderboard.service';
import { MissionCardComponent } from '../../gamification/components/mission-card/mission-card.component';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { ProfileBannerComponent } from '../profile/profile-banner/profile-banner.component';
import { AuthService } from '../../../core/auth/auth.service';
import { RankService } from '../../../core/services/rank.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MissionCardComponent, ProfileBannerComponent],
  template: `
    <div class="dashboard">
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
      
      <!-- Resto del dashboard existente -->
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
  
  protected profile = this.auth.profile;
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected totalAvailableXp = this.missionEngine.totalXpAvailable;
  protected streak = signal<any>(null);
  protected leaderboardTop3 = signal<any[]>([]);
  
  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
      this.loadDashboardData(userId);
      this.rankSvc.load(userId);
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
}
