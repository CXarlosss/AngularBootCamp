import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakWidgetComponent } from '../../../shared/components/streak-widget/streak-widget.component';
import { StreakService } from '../../../core/services/streak.service';
import { STREAK_MOCK_SCENARIOS } from '../../../core/mocks/streak-mock.data';

type ScenarioKey = keyof typeof STREAK_MOCK_SCENARIOS;

@Component({
  selector: 'app-streak-widget-demo',
  standalone: true,
  imports: [CommonModule, StreakWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 24px;">
      <h2>Streak Widget Demo</h2>
      <div style="display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap;">
        @for (key of scenarioKeys; track key) {
          <button (click)="load(key)" style="padding:6px 12px; border-radius:8px; cursor:pointer;">
            {{ key }}
          </button>
        }
        <button (click)="simulateSession()" style="padding:6px 12px; border-radius:8px; cursor:pointer; background: #3b82f6; color: white; border: none;">
          + registrar sesión completada
        </button>
      </div>

      <app-streak-widget></app-streak-widget>
    </div>
  `
})
export class StreakWidgetDemoComponent {
  private readonly streakService = inject(StreakService);
  readonly scenarioKeys = Object.keys(STREAK_MOCK_SCENARIOS) as ScenarioKey[];

  constructor() {
    this.load('active');
  }

  load(key: ScenarioKey): void {
    const scenario = STREAK_MOCK_SCENARIOS[key];
    this.streakService.loadStreakData(scenario.state, scenario.history, scenario.currentWeek);
  }

  simulateSession(): void {
    this.streakService.registerSessionCompleted();
  }
}
