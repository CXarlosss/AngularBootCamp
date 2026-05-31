// src/app/features/client/rank/rank-progress/rank-progress.component.ts

import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getCurrentRankState, RankTier, Division } from '../rank-data';
import { ProgressStore } from '../../../../state/progress.store';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-rank-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rp-card">
      <!-- Header: Rango actual -->
      <div class="rp-header">
        <div class="rp-current">
          <div class="rp-emoji-wrap">
            <span class="rp-emoji">{{ state().currentTier.emoji }}</span>
            <div class="rp-pulse-ring"></div>
          </div>
          <div class="rp-info">
            <span class="rp-label">Tu rango actual</span>
            <h3 class="rp-name">
              {{ state().currentTier.name }}
              <span class="rp-division">{{ state().currentDivision.roman }}</span>
            </h3>
          </div>
        </div>
        
        @if (state().nextTier) {
          <div class="rp-next-preview">
            <span class="rp-next-label">Próximo</span>
            <div class="rp-next-badge">
              <span>{{ state().nextTier!.emoji }}</span>
              <span class="rp-next-name">{{ state().nextTier!.name }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Barra principal -->
      <div class="rp-track-wrap">
        <div class="rp-labels">
          <span class="rp-xp-current">
            ⭐ {{ totalXp | number }} XP
          </span>
          <span class="rp-xp-remaining">
            @if (state().nextDivision) {
              {{ state().xpToNextDivision | number }} XP para {{ state().nextDivision!.label }}
            } @else if (state().nextTier) {
              {{ state().xpToNextTier | number }} XP para {{ state().nextTier!.name }}
            } @else {
              ¡Nivel Máximo alcanzado!
            }
          </span>
          <span class="rp-xp-target">
            ⭐ {{ state().totalXpForNextTier | number }}
          </span>
        </div>
        
        <div class="rp-track">
          <!-- Fondo con divisiones marcadas -->
          <div class="rp-divisions">
            @for (div of divisions(); track div.label) {
              <div 
                class="rp-div-tick"
                [class.passed]="div.xpRequired <= state().xpInCurrentTier"
                [style.left.%]="(div.xpRequired / 2000) * 100">
              </div>
            }
          </div>
          
          <!-- Fill animado -->
          <div 
            class="rp-fill"
            [style.width.%]="animatedProgress()"
            [style.background]="fillGradient()">
            <div class="rp-shimmer"></div>
            <div class="rp-glow-tip"></div>
          </div>
        </div>
      </div>

      <!-- NUEVA SECCIÓN: Métrica premium de Peso Mejorado (KPI) -->
      <div class="rp-stats-kpi">
        <div class="rp-kpi-item">
          <span class="rp-kpi-icon">📈</span>
          <div class="rp-kpi-details">
            <span class="rp-kpi-label">1RM Estimado</span>
            @if (store.loading()) {
              <span class="rp-kpi-val skeleton-text">— kg</span>
            } @else if (store.selectedExercise() === null) {
              <span class="rp-kpi-val loading-pulse">Cargando...</span>
            } @else {
              <span class="rp-kpi-val">
                {{ store.max1RM() }} kg ({{ store.selectedExercise()!.name }})
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Quote motivacional -->
      @if (state().nextTier) {
        <div class="rp-quote">
          <span class="rp-quote-icon">"</span>
          <p>{{ state().nextTier!.quote }}</p>
          <span class="rp-quote-author">— {{ state().nextTier!.name }}</span>
        </div>
      }

      <!-- Acciones rápidas motivacionales -->
      <div class="rp-actions">
        <button class="rp-btn-primary" (click)="onMotivate.emit()">
          🚀 Ver entrenamientos recomendados
        </button>
        <button class="rp-btn-ghost" (click)="onShare.emit()">
          📤 Compartir progreso
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .rp-card {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--c-shadow);
    }

    /* Subtle top gradient line */
    .rp-card::before {
      content: '';
      position: absolute;
      top: 0; left: 24px; right: 24px;
      height: 1px;
      background: linear-gradient(90deg, transparent, v-bind('state().currentTier.frameColor'), transparent);
      opacity: 0.4;
    }

    /* ===== HEADER ===== */
    .rp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .rp-current {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .rp-emoji-wrap {
      position: relative;
      width: 56px; height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rp-emoji {
      font-size: 32px;
      z-index: 2;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .rp-pulse-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid v-bind('state().currentTier.frameColor');
      opacity: 0.3;
      animation: rpPulse 2.5s ease-in-out infinite;
    }

    @keyframes rpPulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.15); opacity: 0.1; }
    }

    .rp-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rp-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--c-text-3);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .rp-name {
      font-size: 22px;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .rp-division {
      font-size: 14px;
      font-weight: 600;
      color: var(--c-text-2);
      background: var(--c-bg);
      padding: 2px 10px;
      border-radius: 8px;
      border: 0.5px solid var(--c-border);
    }

    /* Next preview */
    .rp-next-preview {
      text-align: right;
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    .rp-next-preview:hover { opacity: 0.8; }

    .rp-next-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--c-text-3);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: block;
      margin-bottom: 4px;
    }

    .rp-next-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--c-text-2);
      background: var(--c-bg);
      padding: 6px 12px;
      border-radius: 12px;
      border: 0.5px solid var(--c-border);
    }

    .rp-next-name {
      font-size: 12px;
    }

    /* ===== TRACK ===== */
    .rp-track-wrap {
      margin-bottom: 24px;
    }

    .rp-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 500;
    }

    .rp-xp-current {
      color: var(--c-text-1);
      font-variant-numeric: tabular-nums;
    }

    .rp-xp-remaining {
      color: var(--c-green);
      font-weight: 600;
      text-align: center;
      flex: 1;
      padding: 0 12px;
    }

    .rp-xp-target {
      color: var(--c-text-3);
      font-variant-numeric: tabular-nums;
    }

    .rp-track {
      height: 14px;
      background: var(--c-bg);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
      border: 0.5px solid var(--c-border);
    }

    /* Division ticks */
    .rp-divisions {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .rp-div-tick {
      position: absolute;
      top: 2px; bottom: 2px;
      width: 2px;
      background: var(--c-border);
      border-radius: 2px;
      transition: background 0.4s;
    }

    .rp-div-tick.passed {
      background: rgba(255,255,255,0.15);
    }

    /* Fill */
    .rp-fill {
      height: 100%;
      border-radius: 14px;
      position: relative;
      transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .rp-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.2) 50%,
        transparent 100%
      );
      animation: rpShimmer 2.5s infinite;
    }

    @keyframes rpShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    .rp-glow-tip {
      position: absolute;
      right: -2px;
      top: -2px; bottom: -2px;
      width: 8px;
      border-radius: 14px;
      background: inherit;
      filter: blur(6px);
      opacity: 0.6;
    }

    /* ===== QUOTE ===== */
    .rp-quote {
      background: var(--c-bg);
      border: 0.5px solid var(--c-border);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 20px;
      position: relative;
      text-align: center;
    }

    .rp-quote-icon {
      position: absolute;
      top: 8px; left: 16px;
      font-size: 48px;
      line-height: 1;
      color: var(--c-border);
      font-family: Georgia, serif;
      opacity: 0.5;
      user-select: none;
    }

    .rp-quote p {
      font-size: 14px;
      font-weight: 500;
      color: var(--c-text-2);
      font-style: italic;
      margin: 0 0 8px;
      position: relative;
      z-index: 1;
    }

    .rp-quote-author {
      font-size: 11px;
      font-weight: 600;
      color: var(--c-text-3);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* ===== ACTIONS ===== */
    .rp-actions {
      display: flex;
      gap: 10px;
    }

    .rp-btn-primary {
      flex: 1;
      padding: 12px 20px;
      border-radius: 14px;
      border: none;
      background: var(--c-green);
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .rp-btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .rp-btn-primary:active {
      transform: translateY(0) scale(0.98);
    }

    .rp-btn-ghost {
      padding: 12px 20px;
      border-radius: 14px;
      border: 0.5px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text-2);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .rp-btn-ghost:hover {
      border-color: var(--c-border-hover);
      color: var(--c-text-1);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .rp-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .rp-next-preview {
        text-align: left;
        width: 100%;
      }
      .rp-actions {
        flex-direction: column;
      }
    }

    /* ===== KPI METRIC SPECIAL ACCENT ===== */
    .rp-stats-kpi {
      background: rgba(255, 255, 255, 0.02);
      border: 0.5px dashed var(--c-border);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
    }

    .rp-stats-kpi:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--c-green);
    }

    .rp-kpi-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .rp-kpi-icon {
      font-size: 24px;
      background: rgba(29, 158, 117, 0.1);
      border-radius: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(29, 158, 117, 0.15);
    }

    .rp-kpi-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rp-kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--c-text-3);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .rp-kpi-val {
      font-size: 18px;
      font-weight: 700;
      color: var(--c-green);
    }

    .skeleton-text {
      color: var(--c-text-3);
      animation: pulse 1.5s infinite ease-in-out;
    }

    .loading-pulse {
      font-size: 14px;
      color: var(--c-text-3);
      animation: pulse 1.5s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.3; }
    }
  `]
})
export class RankProgressComponent implements OnChanges, OnInit {
  @Input({ required: true }) totalXp!: number;
  
  @Output() onMotivate = new EventEmitter<void>();
  @Output() onShare = new EventEmitter<void>();

  readonly store = inject(ProgressStore);
  private auth = inject(AuthService);

  // Animación progresiva de la barra
  private targetProgress = signal(0);
  animatedProgress = signal(0);

  state = computed(() => getCurrentRankState(this.totalXp));

  ngOnInit() {
    const clientId = this.auth.user()?.id;
    if (clientId) {
      this.store.loadWeightImproved(clientId);
    }
  }
  
  divisions = computed(() => [
    { label: 'IV', xpRequired: 0 },
    { label: 'III', xpRequired: 500 },
    { label: 'II', xpRequired: 1000 },
    { label: 'I', xpRequired: 1500 },
  ]);

  // Gradiente que anticipa el siguiente color
  fillGradient = computed(() => {
    const s = this.state();
    const current = s.currentTier.frameColor;
    const next = s.nextTier?.frameColor ?? current;
    // Evitar gradientes si no hay color definido
    if (current === 'transparent') return next;
    return `linear-gradient(90deg, ${current}, ${next})`;
  });

  ngOnChanges() {
    const progress = this.state().progressInTier * 100;
    this.targetProgress.set(progress);
    
    // Animación suave al cargar
    setTimeout(() => {
      this.animatedProgress.set(progress);
    }, 100);
  }
}
