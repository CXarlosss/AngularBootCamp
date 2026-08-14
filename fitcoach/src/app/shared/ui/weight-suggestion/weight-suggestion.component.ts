import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeightSuggestion } from '../../../core/services/weight-suggestion.service';

@Component({
  selector: 'fc-weight-suggestion',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (suggestion(); as s) {
      <div class="ws-card" [class]="'ws-' + s.progressionType">
        <!-- Header -->
        <div class="ws-header">
          <div class="ws-bulb">💡</div>
          <div class="ws-header-text">
            <h3>Sugerencia para hoy</h3>
            <span class="ws-confidence" [class]="'conf-' + s.confidence">
              @if (s.confidence === 'high') { ✅ Alta confianza }
              @if (s.confidence === 'medium') { ⚡ Media confianza }
              @if (s.confidence === 'low') { ❓ Poca data }
            </span>
          </div>
        </div>

        <!-- Sugerencia principal -->
        <div class="ws-main">
          <div class="ws-last-week">
            <span class="ws-label">Semana pasada</span>
            <span class="ws-value">{{ s.lastWeekBest?.weight }}kg × {{ s.lastWeekBest?.reps }}</span>
          </div>

          <div class="ws-arrow" [class]="'arrow-' + s.progressionType">
            @if (s.progressionType === 'increase_weight') { ↑ +{{ s.deltaFromLastWeek }}kg }
            @if (s.progressionType === 'increase_reps') { ↑ +1 rep }
            @if (s.progressionType === 'maintain') { → Igual }
            @if (s.progressionType === 'deload') { ↓ {{ s.deltaFromLastWeek }}kg }
          </div>

          <div class="ws-suggested">
            <span class="ws-label">Sugerido</span>
            <span class="ws-suggested-weight">{{ s.suggestedWeight }}kg</span>
            <span class="ws-suggested-reps">× {{ s.suggestedReps }}</span>
          </div>
        </div>

        <!-- Razón -->
        <p class="ws-reasoning">{{ s.reasoning }}</p>

        <!-- Métricas -->
        <div class="ws-metrics">
          <div class="ws-metric">
            <span class="ws-metric-label">1RM Est.</span>
            <span class="ws-metric-value">{{ s.oneRM }}kg</span>
            <span class="ws-metric-formula">{{ s.oneRMFormula }}</span>
          </div>
          <div class="ws-metric">
            <span class="ws-metric-label">% del PR</span>
            <span class="ws-metric-value" [class.pr-high]="s.prPercent >= 95">
              {{ s.prPercent }}%
            </span>
            <div class="ws-pr-bar">
              <div class="ws-pr-fill" [style.width.%]="s.prPercent"></div>
            </div>
          </div>
          @if (s.personalRecord) {
            <div class="ws-metric">
              <span class="ws-metric-label">PR Actual</span>
              <span class="ws-metric-value pr">{{ s.personalRecord.weight }}kg</span>
            </div>
          }
        </div>

        <!-- Botones -->
        <div class="ws-actions">
          <button class="ws-btn-primary" (click)="useSuggestion.emit(s)">
            Usar sugerencia
          </button>
          <button class="ws-btn-secondary" (click)="customize.emit()">
            Personalizar
          </button>
        </div>
      </div>
    }
  `,
  styleUrl: './weight-suggestion.component.scss'
})
export class WeightSuggestionComponent {
  suggestion = input<WeightSuggestion | null>(null);
  useSuggestion = output<WeightSuggestion>();
  customize = output<void>();
}
