// src/app/features/client/dashboard/components/next-goal/next-goal.component.ts

import { Component, inject, computed, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankService } from '../../../../../core/services/rank.service';

@Component({
  selector: 'app-next-goal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ng-card" (click)="onAction.emit()">
      <div class="ng-header">
        <span class="ng-label">🎯 PRÓXIMO OBJETIVO</span>
        <span class="ng-xp-needed">Faltan {{ xpRemaining() | number }} XP</span>
      </div>

      <div class="ng-content">
        <div class="ng-icon-box" [style.background]="goal().color">
          <span class="ng-emoji">{{ goal().emoji }}</span>
          <div class="ng-icon-glow"></div>
        </div>

        <div class="ng-details">
          <h4 class="ng-goal-name">{{ goal().name }}</h4>
          <p class="ng-goal-type">{{ goal().typeLabel }}</p>
          
          <div class="ng-progress-wrap">
            <div class="ng-progress-track">
              <div class="ng-progress-fill" [style.width.%]="progress()">
                <div class="ng-shimmer"></div>
              </div>
            </div>
            <span class="ng-pct">{{ progress() }}%</span>
          </div>
        </div>
        
        <div class="ng-arrow">→</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ng-card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 24px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .ng-card:hover {
      transform: translateY(-4px);
      border-color: var(--c-green-glow);
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    }

    .ng-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .ng-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--c-text-4);
      letter-spacing: 1.5px;
    }

    .ng-xp-needed {
      font-size: 11px;
      font-weight: 700;
      color: var(--c-green);
    }

    .ng-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .ng-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .ng-emoji { font-size: 28px; z-index: 1; }

    .ng-icon-glow {
      position: absolute;
      inset: -4px;
      background: inherit;
      filter: blur(12px);
      opacity: 0.3;
    }

    .ng-details { flex: 1; }

    .ng-goal-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0;
    }

    .ng-goal-type {
      font-size: 12px;
      color: var(--c-text-3);
      margin: 2px 0 10px;
    }

    /* Progress Bar */
    .ng-progress-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ng-progress-track {
      flex: 1;
      height: 6px;
      background: var(--c-bg);
      border-radius: 10px;
      overflow: hidden;
      border: 0.5px solid var(--c-border);
    }

    .ng-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--c-green), #3b82f6);
      border-radius: 10px;
      position: relative;
      transition: width 1s ease-out;
    }

    .ng-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    .ng-pct {
      font-size: 11px;
      font-weight: 700;
      color: var(--c-text-2);
      min-width: 30px;
    }

    .ng-arrow {
      color: var(--c-text-4);
      font-size: 20px;
      transition: transform 0.2s;
    }

    .ng-card:hover .ng-arrow {
      transform: translateX(4px);
      color: var(--c-green);
    }
  `]
})
export class NextGoalComponent {
  rankSvc = inject(RankService);
  
  @Output() onAction = new EventEmitter<void>();

  // Próximo hito simulado (Zafiro)
  goal = signal({
    name: 'Zafiro',
    typeLabel: 'Nuevo Color de Banner',
    emoji: '💎',
    color: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    targetXp: 2000
  });

  progress = computed(() => {
    const current = this.rankSvc.athleteRank()?.xpTotal ?? 0;
    const target = this.goal().targetXp;
    return Math.min(100, Math.round((current / target) * 100));
  });

  xpRemaining = computed(() => {
    const current = this.rankSvc.athleteRank()?.xpTotal ?? 0;
    return Math.max(0, this.goal().targetXp - current);
  });
}
