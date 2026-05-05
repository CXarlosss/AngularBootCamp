import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QuickFilter = 'all' | 'unlocked' | 'locked';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-bar">
      <div class="qa-filters">
        @for (f of filters; track f.id) {
          <button
            class="qa-btn"
            [class.active]="activeFilter() === f.id"
            (click)="setFilter(f.id)">
            {{ f.emoji }} {{ f.label }}
          </button>
        }
      </div>
      <button class="qa-random" (click)="random.emit()" title="Combinación aleatoria">
        🎲
      </button>
    </div>
  `,
  styles: [`
    .qa-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      gap: 8px;
    }

    .qa-filters {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .qa-btn {
      padding: 6px 12px;
      border-radius: 20px;
      border: 0.5px solid var(--c-border);
      background: var(--c-surface);
      color: var(--c-text-3);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s;

      &.active {
        background: var(--c-surface-2);
        color: var(--c-text-1);
        border-color: var(--c-border-hover);
      }

      &:hover:not(.active) {
        border-color: var(--c-border-hover);
        color: var(--c-text-1);
      }
    }

    .qa-random {
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--c-border);
      background: var(--c-surface);
      font-size: 16px; cursor: pointer;
      flex-shrink: 0;
      transition: all .15s;
      display: flex; align-items: center; justify-content: center;

      &:hover {
        border-color: var(--c-border-hover);
        transform: rotate(20deg);
      }
      &:active { transform: rotate(180deg); }
    }
  `]
})
export class QuickActionsComponent {
  @Output() filterChange = new EventEmitter<QuickFilter>();
  @Output() random       = new EventEmitter<void>();

  activeFilter = signal<QuickFilter>('all');

  readonly filters = [
    { id: 'all'      as QuickFilter, emoji: '🎨', label: 'Todos'         },
    { id: 'unlocked' as QuickFilter, emoji: '🔓', label: 'Disponibles'   },
    { id: 'locked'   as QuickFilter, emoji: '🔒', label: 'Por desbloquear'},
  ];

  setFilter(f: QuickFilter) {
    this.activeFilter.set(f);
    this.filterChange.emit(f);
  }
}
