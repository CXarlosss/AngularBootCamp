// src/app/features/client/dashboard/components/streak-widget/streak-widget.component.ts

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streak-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sw-card" [class.at-risk]="isAtRisk">
      <div class="sw-header">
        <span class="sw-emoji">{{ isAtRisk ? '⚠️' : '🔥' }}</span>
        <div class="sw-info">
          <h4>{{ isAtRisk ? '¡Racha en riesgo!' : 'Racha activa' }}</h4>
          <span class="sw-days">{{ streakDays }} días</span>
        </div>
      </div>
      
      <div class="sw-flames">
        @for (day of [0,1,2,3,4,5,6]; track day) {
          <div class="sw-flame" [class.lit]="day < streakDays % 7"></div>
        }
      </div>
      
      <p class="sw-best">Mejor: {{ bestStreak }} días 🔥</p>
      
      @if (isAtRisk) {
        <button class="sw-cta" (click)="onAction.emit()">
          🏋️ Entrenar ahora
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sw-card {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 24px;
      transition: all 0.3s;
      box-shadow: var(--c-shadow);
    }
    .sw-card.at-risk {
      border-color: rgba(239,68,68,0.3);
      background: linear-gradient(180deg, var(--c-surface), rgba(239,68,68,0.03));
    }
    .sw-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    .sw-emoji { font-size: 2rem; }
    .sw-info h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0 0 2px;
    }
    .sw-days {
      font-size: 0.85rem;
      color: var(--c-text-3);
      font-weight: 600;
    }
    .sw-flames {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
    }
    .sw-flame {
      flex: 1;
      height: 8px;
      background: var(--c-bg);
      border-radius: 4px;
      border: 0.5px solid var(--c-border);
      transition: all 0.3s;
    }
    .sw-flame.lit {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
      box-shadow: 0 0 8px rgba(245,158,11,0.3);
      border-color: transparent;
    }
    .sw-best {
      font-size: 0.8rem;
      color: var(--c-text-4);
      margin: 0 0 16px;
    }
    .sw-cta {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #ef4444, #f59e0b);
      color: white;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class StreakWidgetComponent {
  @Input({ required: true }) streakDays!: number;
  @Input({ required: true }) bestStreak!: number;
  @Input() isAtRisk = false;
  
  @Output() onAction = new EventEmitter<void>();
}
