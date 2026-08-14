import { Component, Input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseHistoryContext } from '../../../core/services/exercise-history.service';

@Component({
  selector: 'fc-weight-comparison',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="weight-comparison-container" *ngIf="history && (history.thisWeek || history.lastWeek)">
      
      <!-- Sparkline 4 weeks -->
      <div class="sparkline-section" *ngIf="sparklinePoints()">
        <svg viewBox="0 0 100 30" class="sparkline-svg" preserveAspectRatio="none">
          <path [attr.d]="sparklinePoints()" class="sparkline-path" />
          <path [attr.d]="sparklineArea()" class="sparkline-area" />
        </svg>
      </div>

      <!-- Progression Badge -->
      <div class="progression-badge" [ngClass]="getProgressionClass()">
        <span class="progression-icon">{{ getProgressionIcon() }}</span>
        <span class="progression-text">{{ getProgressionText() }}</span>
      </div>

      <!-- Side by Side Comparison -->
      <div class="comparison-grid">
        
        <!-- Last Week -->
        <div class="comparison-col" [class.dimmed]="!history.lastWeek">
          <h4 class="col-title">Anterior</h4>
          <span class="col-date">{{ history.lastWeek?.weekLabel || '--' }}</span>
          
          <div class="sets-list">
            @for (set of history.lastWeek?.sets; track set.id; let i = $index) {
              <div class="set-row">
                <span class="set-num">S{{ i + 1 }}</span>
                <span class="set-val">{{ set.weightKg }}kg × {{ set.repsDone }}</span>
              </div>
            } @empty {
              <div class="set-row empty">-</div>
            }
          </div>

          <div class="col-footer">
            <div class="footer-metric">
              <span class="icon">🏋️</span> Máx: {{ history.lastWeek?.maxWeight || 0 }}kg
            </div>
            <div class="footer-metric">
              <span class="icon">📦</span> Vol: {{ history.lastWeek?.totalVolume || 0 }}kg
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="comparison-divider"></div>

        <!-- This Week -->
        <div class="comparison-col active">
          <h4 class="col-title highlight">Actual</h4>
          <span class="col-date">{{ history.thisWeek?.weekLabel || '--' }}</span>
          
          <div class="sets-list">
            @for (set of history.thisWeek?.sets; track set.id; let i = $index) {
              <div class="set-row" [class.is-pr]="isSetPR(set)">
                <span class="set-num">S{{ i + 1 }}</span>
                <span class="set-val">{{ set.weightKg }}kg × {{ set.repsDone }}</span>
                <span class="pr-star" *ngIf="isSetPR(set)">⭐</span>
              </div>
            } @empty {
              <div class="set-row empty">-</div>
            }
          </div>

          <div class="col-footer highlight">
            <div class="footer-metric">
              <span class="icon">🏋️</span> Máx: {{ history.thisWeek?.maxWeight || 0 }}kg
            </div>
            <div class="footer-metric">
              <span class="icon">📦</span> Vol: {{ history.thisWeek?.totalVolume || 0 }}kg
            </div>
          </div>
        </div>
      </div>

      <!-- PR Badge -->
      <div class="pr-badge" *ngIf="history.pr">
        <div class="pr-content">
          <span class="crown">👑</span>
          <div class="pr-details">
            <span class="pr-title">Récord Personal</span>
            <span class="pr-value">{{ history.pr.weight }}kg × {{ history.pr.reps }} <span class="pr-date">({{ history.pr.date | date:'dd MMM' }})</span></span>
          </div>
        </div>
      </div>
      
      <!-- Motivational Feedback -->
      <div class="feedback-banner" *ngIf="history.progressionKg > 0">
        🚀 ¡Has subido {{ history.progressionKg }}kg respecto a tu última sesión!
      </div>
    </div>
  `,
  styleUrls: ['./weight-comparison.component.css']
})
export class WeightComparisonComponent {
  @Input() history!: ExerciseHistoryContext;

  sparklinePoints = computed(() => {
    if (!this.history || !this.history.sparklineData || this.history.sparklineData.length < 2) return null;
    
    const data = this.history.sparklineData;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Prevent division by zero
    
    // Scale points to 100x30 SVG box
    // X goes 0 to 100, Y goes 30 (bottom) to 0 (top)
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / range) * 20 - 5; // Add some padding top/bottom
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  });

  sparklineArea = computed(() => {
    const path = this.sparklinePoints();
    if (!path) return null;
    return `${path} L 100,30 L 0,30 Z`;
  });

  getProgressionClass(): string {
    if (!this.history) return 'neutral';
    if (this.history.progressionKg > 0) return 'positive';
    if (this.history.progressionKg < 0) return 'negative';
    return 'neutral';
  }

  getProgressionIcon(): string {
    if (!this.history) return '→';
    if (this.history.progressionKg > 0) return '📈';
    if (this.history.progressionKg < 0) return '📉';
    return '→';
  }

  getProgressionText(): string {
    if (!this.history) return 'Mantenido';
    if (this.history.progressionKg > 0) return `+${this.history.progressionKg}kg`;
    if (this.history.progressionKg < 0) return `${this.history.progressionKg}kg`;
    return 'Mantenido';
  }

  isSetPR(set: any): boolean {
    if (!this.history?.pr) return false;
    return set.weightKg === this.history.pr.weight && set.repsDone === this.history.pr.reps;
  }
}
