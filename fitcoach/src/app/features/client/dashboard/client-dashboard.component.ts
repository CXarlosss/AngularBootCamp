// src/app/features/client/dashboard/client-dashboard.component.ts

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Servicios existentes
import { RankService } from '../../../core/services/rank.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { UnlockCelebrationService } from '../../../shared/services/unlock-celebration/unlock-celebration.service';

import { RankChangeDetectorService } from '../../../core/services/rank-change-detector.service';

// Componentes que ya construimos
import { NextGoalComponent } from './components/next-goal/next-goal.component';
import { RankProgressComponent } from '../rank/rank-progress/rank-progress.component';

// Componentes nuevos para el dashboard
import { StreakWidgetComponent } from './components/streak-widget/streak-widget.component';
import { QuickStatsComponent } from './components/quick-stats/quick-stats.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NextGoalComponent,
    RankProgressComponent,
    StreakWidgetComponent,
    QuickStatsComponent,
    RecentActivityComponent,
  ],
  template: `
    <div class="cd-page">
      
      <!-- ===== BANNER PERSONALIZADO (sticky) ===== -->
      <div class="cd-banner" [style.background]="bannerGradient()">
        <div class="cd-banner-pattern" [class]="'pattern-' + bannerPattern()"></div>
        
        <div class="cd-banner-content">
          <div class="cd-avatar-wrap">
            <div class="cd-avatar-ring" [style.border-color]="rankFrameColor()">
              <div class="cd-avatar">{{ initials() }}</div>
              @if (specialFrame()) {
                <div class="cd-special-frame" [class]="'frame-' + specialFrame()"></div>
              }
            </div>
          </div>
          
          <div class="cd-banner-info">
            <h1 class="cd-name">{{ userName() }}</h1>
            <div class="cd-meta">
              <span class="cd-rank-badge" [style.background]="rankBadgeBg()">
                {{ currentRank()?.emoji }} {{ currentRank()?.name }} {{ currentDivision() }}
              </span>
              <span class="cd-xp">⭐ {{ totalXp() | number }} XP</span>
            </div>
          </div>
          
          <a class="cd-edit-btn" routerLink="/client/profile/banner">
            🎨 Editar
          </a>
        </div>
      </div>

      <!-- ===== GRID PRINCIPAL ===== -->
      <div class="cd-grid">
        
        <!-- COLUMNA IZQUIERDA (60%) -->
        <div class="cd-col-main">
          
          <!-- 🎯 WIDGET: PRÓXIMO OBJETIVO -->
          <app-next-goal
            (onAction)="goToWorkout()" />
          
          <!-- 📊 STATS RÁPIDOS -->
          <app-quick-stats
            [workoutsThisWeek]="workoutsThisWeek()"
            [currentStreak]="currentStreak()"
            [personalRecords]="personalRecords()"
            [rankPosition]="rankPosition()" />
          
          <!-- 📅 ACTIVIDAD RECIENTE -->
          <app-recent-activity [activities]="recentActivities()" />
          
        </div>

        <!-- COLUMNA DERECHA (40%) -->
        <div class="cd-col-side">
          
          <!-- 🔥 RACHA -->
          <app-streak-widget
            [streakDays]="currentStreak()"
            [bestStreak]="bestStreak()"
            [isAtRisk]="streakAtRisk()"
            (onAction)="goToWorkout()" />
          
          <!-- 🏅 PROGRESO DE RANGO (mini) -->
          <div class="cd-rank-mini">
            <h3 class="cd-section-title">Tu camino al Olimpo</h3>
            <app-rank-progress
              [totalXp]="totalXp()"
              (onMotivate)="goToWorkout()"
              (onShare)="shareProgress()" />
          </div>
          
          <!-- 🎨 PREVIEW DE PERSONALIZACIÓN -->
          <div class="cd-customize-cta">
            <h3 class="cd-section-title">Tu estilo</h3>
            <div class="cd-style-preview">
              <div class="cd-style-swatch" [style.background]="bannerGradient()"></div>
              <div class="cd-style-info">
                <p>{{ bannerColorName() }} + {{ bannerPatternName() }}</p>
                <a routerLink="/client/profile/banner">Personalizar →</a>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  `,
  styles: [`
    :host { display: block; }

    .cd-page {
      min-height: 100vh;
      padding-bottom: 40px;
    }

    /* ===== BANNER PERSONALIZADO ===== */
    .cd-banner {
      position: relative;
      padding: 32px 24px;
      margin-bottom: 24px;
      overflow: hidden;
      border-bottom: 0.5px solid var(--c-border);
    }

    .cd-banner-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      pointer-events: none;
    }

    .pattern-dots {
      background-image: radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px);
      background-size: 12px 12px;
    }

    .cd-banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cd-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .cd-avatar-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 3px solid;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }

    .cd-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
    }

    .cd-special-frame {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 2px dashed rgba(251,191,36,0.5);
      animation: rotateFrame 10s linear infinite;
    }

    @keyframes rotateFrame {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .cd-banner-info {
      flex: 1;
    }

    .cd-name {
      font-size: 1.6rem;
      font-weight: 700;
      color: white;
      margin: 0 0 6px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .cd-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cd-rank-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: white;
      backdrop-filter: blur(8px);
    }

    .cd-xp {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255,255,255,0.8);
      font-variant-numeric: tabular-nums;
    }

    .cd-edit-btn {
      padding: 10px 20px;
      border-radius: 14px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      border: 0.5px solid rgba(255,255,255,0.15);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .cd-edit-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }

    /* ===== GRID PRINCIPAL ===== */
    .cd-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    @media (max-width: 900px) {
      .cd-grid {
        grid-template-columns: 1fr;
      }
    }

    .cd-col-main {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .cd-col-side {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ===== SECCIONES LATERALES ===== */
    .cd-section-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0 0 16px;
    }

    .cd-rank-mini {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--c-shadow);
    }

    .cd-customize-cta {
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--c-shadow);
    }

    .cd-style-preview {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cd-style-swatch {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: 0.5px solid var(--c-border);
      flex-shrink: 0;
    }

    .cd-style-info p {
      font-size: 0.85rem;
      color: var(--c-text-3);
      margin: 0 0 6px;
    }

    .cd-style-info a {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--c-green);
      text-decoration: none;
    }

    .cd-style-info a:hover {
      text-decoration: underline;
    }
  `]
})
export class ClientDashboardComponent {
  private rankSvc = inject(RankService);
  private toast = inject(ToastService);
  private celebration = inject(UnlockCelebrationService);
  private rankDetector = inject(RankChangeDetectorService);

  userName = signal('Maite G.');
  initials = signal('MG');
  
  bannerColor = signal('oceano');
  bannerPattern = signal('dots');
  specialFrame = signal<string | null>('llama_eterna');

  async ngOnInit() {
    await this.rankSvc.load();
    this.rankDetector.initialize();
  }

  totalXp = computed(() => this.rankSvc.athleteRank()?.xpTotal ?? 0);
  currentRank = computed(() => this.rankSvc.fullRank()?.rank ?? null);
  currentDivision = computed(() => this.rankSvc.fullRank()?.divLabel ?? 'IV');
  
  bannerGradient = computed(() => {
    const colors: Record<string, string> = {
      obsidiana: 'linear-gradient(135deg, #0f172a, #1e293b)',
      bronce: 'linear-gradient(135deg, #78350f, #92400e)',
      esmeralda: 'linear-gradient(135deg, #064e3b, #065f46)',
      oceano: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
      zafiro: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      dorado: 'linear-gradient(135deg, #ca8a04, #fbbf24)',
    };
    return colors[this.bannerColor()] ?? colors['oceano'];
  });

  bannerColorName = computed(() => 
    this.bannerColor().charAt(0).toUpperCase() + this.bannerColor().slice(1)
  );
  
  bannerPatternName = computed(() => 
    this.bannerPattern().charAt(0).toUpperCase() + this.bannerPattern().slice(1)
  );

  rankFrameColor = computed(() => {
    const s = this.rankSvc.fullRank();
    return s?.rank.color ?? 'transparent';
  });

  rankBadgeBg = computed(() => {
    const s = this.rankSvc.fullRank();
    if (!s) return 'rgba(255,255,255,0.1)';
    return `${s.rank.color}33`; // 33 es 20% alpha en hex
  });

  workoutsThisWeek = signal(4);
  currentStreak = signal(12);
  bestStreak = signal(30);
  personalRecords = signal(3);
  rankPosition = signal(42);
  streakAtRisk = signal(false);

  recentActivities = signal([
    { type: 'workout', title: 'Entrenamiento de pierna', xp: 120, date: 'Hoy, 14:30' },
    { type: 'unlock', title: 'Color Dorado desbloqueado', date: 'Ayer' },
    { type: 'rank', title: 'Subiste a Legionario II', date: 'Hace 3 días' },
    { type: 'pr', title: 'Nuevo récord: 80kg press banca', date: 'Hace 5 días' },
  ]);

  goToWorkout() {
    this.toast.info('¡Vamos!', 'Cargando tu rutina de hoy...');
  }

  shareProgress() {
    this.toast.success('¡Progreso copiado!', 'Listo para compartir en redes');
  }

  /**
   * TEST: Simular subida de rango (Solo para pruebas en local)
   */
  simulateRankUp() {
    const cur = this.rankSvc.athleteRank();
    if (!cur) return;
    
    // Añadimos XP suficiente para saltar a Legionario si estamos en Recruta
    this.rankSvc.addXP({ daysXp: 600, setsXp: 0, progressXp: 0 });
    this.toast.info('Simulando...', 'Añadiendo XP para forzar subida de rango');
  }
}
