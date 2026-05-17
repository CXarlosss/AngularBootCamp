// src/app/features/client/dashboard/components/recent-activity/recent-activity.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Activity {
  type: string;
  title: string;
  xp?: number;
  date: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ra-card">
      <h3 class="ra-title">Actividad Reciente</h3>
      
      <div class="ra-list">
        @for (act of activities; track act.title + act.date) {
          <div class="ra-item">
            <div class="ra-icon" [attr.data-type]="act.type">
              {{ getIcon(act.type) }}
            </div>
            <div class="ra-info">
              <p class="ra-item-title">{{ act.title }}</p>
              <p class="ra-item-date">{{ act.date }}</p>
            </div>
            @if (act.xp) {
              <div class="ra-xp">+{{ act.xp }} XP</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ra-card {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 24px;
      padding: 24px;
      box-shadow: var(--c-shadow);
    }
    .ra-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0 0 20px;
    }
    .ra-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ra-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 0.5px solid var(--c-border);
    }
    .ra-item:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }
    .ra-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      background: var(--c-bg);
    }
    .ra-icon[data-type="workout"] { background: rgba(16,185,129,0.1); }
    .ra-icon[data-type="unlock"] { background: rgba(139,92,246,0.1); }
    .ra-icon[data-type="rank"] { background: rgba(251,191,36,0.1); }
    .ra-icon[data-type="pr"] { background: rgba(239,68,68,0.1); }

    .ra-info { flex: 1; }
    .ra-item-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--c-text-1);
      margin: 0 0 2px;
    }
    .ra-item-date {
      font-size: 0.8rem;
      color: var(--c-text-4);
      margin: 0;
    }
    .ra-xp {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--c-green);
    }
  `]
})
export class RecentActivityComponent {
  @Input() activities: Activity[] = [];

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      workout: '💪',
      unlock: '🔓',
      rank: '🏅',
      pr: '🔥'
    };
    return icons[type] ?? '✨';
  }
}
