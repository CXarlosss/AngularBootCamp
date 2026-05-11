// src/app/features/gamification/components/mission-card/mission-card.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mission } from '../../services/mission-engine.service';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mission-card" [class.completed]="mission().isCompleted" [class.claimed]="mission().isClaimed">
      <div class="mission-header">
        <span class="mission-icon">{{ mission().icon }}</span>
        <div class="mission-info">
          <h4 class="mission-title">{{ mission().title }}</h4>
          <span class="mission-difficulty" [class]="'diff-' + mission().difficulty">
            {{ difficultyLabel() }}
          </span>
        </div>
        <span class="xp-reward">+{{ mission().xpReward }} XP</span>
      </div>
      
      <p class="mission-desc">{{ mission().description }}</p>
      
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar" [style.width.%]="mission().progressPct"></div>
        <span class="progress-text">
          {{ mission().currentValue }} / {{ mission().targetValue }}
        </span>
      </div>
      
      <!-- Action -->
      @if (mission().isCompleted && !mission().isClaimed) {
        <button class="claim-btn" (click)="onClaim.emit(mission().id)">
          Reclamar recompensa
        </button>
      } @else if (mission().isClaimed) {
        <span class="claimed-badge">✓ Reclamado</span>
      }
    </div>
  `,
  styles: [`
    .mission-card {
      background: #1e1e2e;
      border-radius: 16px;
      padding: 16px;
      border: 2px solid #2d2d44;
      transition: all 0.2s;
      margin-bottom: 12px;
    }
    .mission-card.completed { border-color: #4CAF50; }
    .mission-card.claimed { opacity: 0.6; }
    
    .mission-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .mission-icon { font-size: 28px; }
    .mission-info { flex: 1; }
    .mission-title { margin: 0; font-size: 15px; color: #fff; }
    .mission-difficulty {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
    .diff-1 { background: #2d442d; color: #4CAF50; }
    .diff-2 { background: #443d2d; color: #FF9800; }
    .diff-3 { background: #442d2d; color: #f44336; }
    
    .xp-reward {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }
    
    .mission-desc { color: #aaa; font-size: 13px; margin: 0 0 12px 0; }
    
    .progress-container {
      background: #2d2d44;
      border-radius: 10px;
      height: 28px;
      position: relative;
      overflow: hidden;
    }
    .progress-bar {
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      height: 100%;
      border-radius: 10px;
      transition: width 0.5s ease;
    }
    .progress-text {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    
    .claim-btn {
      width: 100%;
      margin-top: 12px;
      padding: 12px;
      background: #ffc107;
      color: #1a1a2e;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .claim-btn:active { transform: scale(0.98); }
    
    .claimed-badge {
      display: block;
      text-align: center;
      margin-top: 12px;
      color: #4CAF50;
      font-size: 13px;
      font-weight: 600;
    }
  `]
})
export class MissionCardComponent {
  readonly mission = input.required<Mission>();
  readonly onClaim = output<string>();
  
  protected difficultyLabel(): string {
    const labels = ['', 'Fácil', 'Media', 'Difícil'];
    return labels[this.mission().difficulty] || '';
  }
}
