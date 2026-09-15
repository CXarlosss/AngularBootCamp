import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fc-history-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hes-container">
      <!-- Ilustración SVG animada -->
      <div class="hes-illustration">
        <svg viewBox="0 0 200 160" class="hes-svg">
          <!-- Pesa -->
          <rect x="60" y="70" width="80" height="12" rx="6" fill="var(--c-text-3, #5F5E5A)" opacity="0.3"/>
          <rect x="50" y="60" width="16" height="32" rx="4" fill="var(--c-text-3, #5F5E5A)" opacity="0.3"/>
          <rect x="134" y="60" width="16" height="32" rx="4" fill="var(--c-text-3, #5F5E5A)" opacity="0.3"/>
          <!-- Barra -->
          <rect x="70" y="74" width="60" height="4" rx="2" fill="var(--c-text-2, #9E9C97)" opacity="0.5"/>
          <!-- Partículas flotantes -->
          <circle cx="40" cy="40" r="3" fill="var(--c-green, #1D9E75)" opacity="0.6">
            <animate attributeName="cy" values="40;30;40" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="160" cy="50" r="2" fill="var(--c-gold, #fbbf24)" opacity="0.5">
            <animate attributeName="cy" values="50;40;50" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="100" cy="30" r="2.5" fill="var(--c-fire, #E63946)" opacity="0.4">
            <animate attributeName="cy" values="30;25;30" dur="2s" repeatCount="indefinite"/>
          </circle>
          <!-- Línea de base -->
          <line x1="30" y1="120" x2="170" y2="120" stroke="var(--c-border, rgba(255,255,255,0.06))" stroke-width="1" stroke-dasharray="4,4"/>
        </svg>
      </div>

      <h2 class="hes-title">Aún no hay entrenamientos</h2>
      <p class="hes-description">
        Completa tu primera rutina y verás aquí todo tu historial, 
        con estadísticas, progresión y récords personales.
      </p>

      <div class="hes-benefits">
        <div class="hes-benefit">
          <span class="hes-benefit-icon">📊</span>
          <span>Seguimiento de pesos</span>
        </div>
        <div class="hes-benefit">
          <span class="hes-benefit-icon">🏆</span>
          <span>Detección de PRs</span>
        </div>
        <div class="hes-benefit">
          <span class="hes-benefit-icon">📈</span>
          <span>Gráficos de progreso</span>
        </div>
      </div>

      <button class="hes-cta" (click)="startWorkout.emit()">
        <span class="hes-cta-icon">💪</span>
        Empezar primer entrenamiento
      </button>
    </div>
  `,
  styleUrl: './history-empty-state.component.scss'
})
export class HistoryEmptyStateComponent {
  startWorkout = output<void>();
}
