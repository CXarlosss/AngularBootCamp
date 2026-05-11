// src/app/features/client/dashboard/client-dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionEngineService } from '../../../gamification/services/mission-engine.service';
import { StreakWeeklyService } from '../../../gamification/services/streak-weekly.service';
import { LeaderboardService } from '../../../gamification/services/leaderboard.service';
import { MissionCardComponent } from '../../../gamification/components/mission-card/mission-card.component';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MissionCardComponent],
  template: `
    <div class="dashboard">
      <!-- Banner de identidad (existente) -->
      <div class="identity-banner">...</div>
      
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
export class ClientDashboardComponent {
  private featureFlags = inject(FeatureFlagService);
  private missionEngine = inject(MissionEngineService);
  private streakService = inject(StreakWeeklyService);
  private leaderboard = inject(LeaderboardService);
  
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected totalAvailableXp = this.missionEngine.totalXpAvailable;
  protected streak = signal<any>(null);
  protected leaderboardTop3 = signal<any[]>([]);
  
  constructor() {
    const userId = 'current-user-id';
    this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
    
    if (this.gamificationEnabled()) {
      this.loadDashboardData(userId);
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
    await this.missionEngine.claimXp('current-user-id', missionId);
    // Recargar
    await this.loadDashboardData('current-user-id');
  }
  
  protected streakWeeks = computed(() => {
    // Array de 8 semanas para visualización
    const streak = this.streak()?.currentStreak || 0;
    return Array(8).fill(false).map((_, i) => i < streak);
  });
}
