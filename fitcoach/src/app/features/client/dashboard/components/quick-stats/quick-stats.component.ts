// src/app/features/client/dashboard/components/quick-stats/quick-stats.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qs-grid">
      <div class="qs-item">
        <span class="qs-val">{{ workoutsThisWeek }}</span>
        <span class="qs-lbl">Entrenos / semana</span>
      </div>
      <div class="qs-item">
        <span class="qs-val">{{ currentStreak }}</span>
        <span class="qs-lbl">Días de racha</span>
      </div>
      <div class="qs-item">
        <span class="qs-val">{{ personalRecords }}</span>
        <span class="qs-lbl">Récords (PRs)</span>
      </div>
      <div class="qs-item">
        <span class="qs-val">#{{ rankPosition }}</span>
        <span class="qs-lbl">Ranking Global</span>
      </div>
    </div>
  `,
  styles: [`
    .qs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (min-width: 600px) {
      .qs-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .qs-item {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: var(--c-shadow);
      transition: transform 0.2s;
    }
    .qs-item:hover { transform: translateY(-2px); }
    .qs-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--c-text-1);
    }
    .qs-lbl {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--c-text-3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class QuickStatsComponent {
  @Input() workoutsThisWeek = 0;
  @Input() currentStreak = 0;
  @Input() personalRecords = 0;
  @Input() rankPosition = 0;
}
