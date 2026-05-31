// src/app/features/coach/client-detail/components/client-identity-view/client-identity-view.component.ts

import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankService, FullRank, AthleteRank } from '../../../../../core/services/rank.service';
import { ToastService } from '../../../../../shared/services/toast/toast.service';
import { supabase } from '../../../../../core/supabase.client';
import { getFrameById } from '../../../../client/profile/frame-catalog';

@Component({
  selector: 'app-client-identity-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="civ-container">
      
      <!-- Banner Preview (Exactamente como el del cliente) -->
      <div class="civ-banner" [style.background]="bannerGradient()">
        <div class="civ-banner-pattern" [class]="'pattern-' + bannerPattern()"></div>
        
        <div class="civ-banner-content">
          <div class="civ-avatar-wrap">
            <div class="avatar-frame-wrapper frame-lg" [class]="frameCssClass()">
              <div class="civ-avatar">{{ initials() }}</div>
            </div>
          </div>
          
          <div class="civ-banner-info">
            <h1 class="civ-name">{{ clientName }}</h1>
            <div class="civ-meta">
              <span class="civ-rank-badge" [style.background]="rankBadgeBg()">
                {{ fullRank()?.rank?.emoji }} {{ fullRank()?.rank?.name }} {{ fullRank()?.divLabel }}
              </span>
              <span class="civ-xp">⭐ {{ athleteRank()?.xpTotal || 0 | number }} XP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights & Motivation -->
      <div class="civ-grid">
        
        <div class="civ-card civ-stats">
          <h3 class="civ-card-title">Estadísticas de Identidad</h3>
          <div class="civ-stats-row">
            <div class="civ-stat">
              <span class="civ-stat-val">{{ athleteRank()?.daysXp || 0 }}</span>
              <span class="civ-stat-lbl">XP por Racha</span>
            </div>
            <div class="civ-stat">
              <span class="civ-stat-val">{{ athleteRank()?.setsXp || 0 }}</span>
              <span class="civ-stat-lbl">XP por Volumen</span>
            </div>
          </div>
        </div>

        <div class="civ-card civ-next">
          <h3 class="civ-card-title">Próximo Hito del Cliente</h3>
          <div class="civ-next-content">
            <div class="civ-next-info">
              <span class="civ-next-emoji">💎</span>
              <div>
                <p class="civ-next-name">Zafiro (Color)</p>
                <p class="civ-next-rem">Faltan {{ xpToNextGoal() }} XP</p>
              </div>
            </div>
            <div class="civ-progress-bar">
              <div class="civ-progress-fill" [style.width.%]="goalProgress()"></div>
            </div>
          </div>
        </div>

      </div>

      <!-- AI Suggestion & Action -->
      <div class="civ-suggestion">
        <div class="civ-sug-icon">💡</div>
        <div class="civ-sug-text">
          <p><strong>Sugerencia Proactiva:</strong> {{ clientName }} está a solo {{ xpToNextGoal() }} XP del nivel Zafiro. Un mensaje motivador hoy podría asegurar su entrenamiento de mañana.</p>
        </div>
      </div>

      <div class="civ-actions">
        <button class="civ-btn-push" (click)="sendMotivation()">
          🚀 Enviar Push de Motivación
        </button>
      </div>

      <!-- 🎁 SECCIÓN DE REGALOS -->
      <div class="civ-card civ-gifting">
        <h3 class="civ-card-title">🎁 Otorgar Recompensa Especial</h3>
        <p class="civ-gifting-desc">Reconoce el esfuerzo extraordinario otorgando un marco que no se puede conseguir con XP.</p>
        
        <div class="civ-gift-list">
          @for (gift of grantableFrames(); track gift.id) {
            <div class="civ-gift-item" [class.already-has]="hasFrame(gift.id)">
              <div class="civ-gift-icon">{{ gift.emoji }}</div>
              <div class="civ-gift-info">
                <p class="civ-gift-name">{{ gift.name }}</p>
                <p class="civ-gift-req">{{ gift.description }}</p>
              </div>
              <button 
                class="civ-btn-gift" 
                [disabled]="hasFrame(gift.id)"
                (click)="grantFrame(gift.id, gift.name)">
                {{ hasFrame(gift.id) ? 'Ya otorgado' : 'Otorgar →' }}
              </button>
            </div>
          }
        </div>
      </div>

      <div class="civ-history">
        <button class="civ-btn-outline" (click)="viewActivity()">
          📅 Ver historial completo de actividad
        </button>
      </div>

    </div>
  `,
  styles: [`
    .civ-container { padding: 0; }

    /* Banner Styles */
    .civ-banner {
      position: relative;
      padding: 40px 24px;
      margin-bottom: 24px;
      overflow: hidden;
      border-radius: 0 0 32px 32px;
      border-bottom: 1px solid var(--c-border);
    }
    .civ-banner-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      pointer-events: none;
    }
    .pattern-dots {
      background-image: radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px);
      background-size: 12px 12px;
    }

    .civ-banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .civ-avatar-wrap {
      width: 80px; height: 80px;
      display: flex; align-items: center; justify-content: center;
    }
    .civ-avatar {
      width: 100%; height: 100%; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 800; color: white;
    }
    /* avatar-frame-wrapper gets its styles from frames.css globally */

    .civ-name { font-size: 1.8rem; font-weight: 800; color: white; margin: 0 0 8px; }
    .civ-meta { display: flex; align-items: center; gap: 12px; }
    .civ-rank-badge {
      padding: 4px 14px; border-radius: 20px;
      font-size: 0.85rem; font-weight: 700; color: white;
      backdrop-filter: blur(10px);
    }
    .civ-xp { font-size: 0.9rem; color: rgba(255,255,255,0.8); font-weight: 600; }

    /* Grid & Cards */
    .civ-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; padding: 0 16px; margin-bottom: 24px;
    }
    @media (max-width: 600px) { .civ-grid { grid-template-columns: 1fr; } }

    .civ-card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 24px; padding: 20px;
    }
    .civ-card-title { font-size: 0.85rem; color: var(--c-text-4); margin-bottom: 16px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

    .civ-stats-row { display: flex; justify-content: space-between; }
    .civ-stat { display: flex; flex-direction: column; gap: 4px; }
    .civ-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--c-text-1); }
    .civ-stat-lbl { font-size: 0.75rem; color: var(--c-text-4); font-weight: 600; }

    .civ-next-info { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .civ-next-emoji { font-size: 1.8rem; }
    .civ-next-name { font-size: 1rem; font-weight: 700; color: var(--c-text-1); margin: 0; }
    .civ-next-rem { font-size: 0.8rem; color: var(--c-green); margin: 0; font-weight: 600; }

    .civ-progress-bar { height: 6px; background: var(--c-bg); border-radius: 10px; overflow: hidden; }
    .civ-progress-fill { height: 100%; background: var(--c-green); border-radius: 10px; }

    /* Suggestion */
    .civ-suggestion {
      margin: 0 16px 24px; padding: 20px;
      background: rgba(139,92,246,0.1);
      border-radius: 20px; display: flex; gap: 16px;
      border: 1px solid rgba(139,92,246,0.2);
    }
    .civ-sug-icon { font-size: 1.5rem; }
    .civ-sug-text p { margin: 0; font-size: 0.9rem; color: var(--c-text-2); line-height: 1.5; }

    /* Actions */
    .civ-actions { display: flex; flex-direction: column; gap: 12px; padding: 0 16px; }
    .civ-btn-push {
      padding: 16px; border-radius: 16px; border: none;
      background: var(--c-green); color: white; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: 0.2s;
    }
    .civ-btn-push:hover { transform: scale(1.02); filter: brightness(1.1); }
    .civ-btn-outline {
      padding: 12px; border-radius: 16px; border: 1px solid var(--c-border);
      background: transparent; color: var(--c-text-3); font-size: 0.9rem; font-weight: 600;
      cursor: pointer; width: 100%;
    }

    /* Gifting Styles */
    .civ-gifting { margin: 24px 16px; border-color: rgba(251,191,36,0.3); }
    .civ-gifting-desc { font-size: 0.85rem; color: var(--c-text-3); margin-bottom: 20px; line-height: 1.5; }
    
    .civ-gift-list { display: flex; flex-direction: column; gap: 12px; }
    .civ-gift-item {
      display: flex; align-items: center; gap: 12px; padding: 12px;
      background: var(--c-bg); border-radius: 16px; border: 1px solid var(--c-border);
    }
    .civ-gift-item.already-has { opacity: 0.6; border-style: dashed; }
    
    .civ-gift-icon { font-size: 1.5rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--c-surface); border-radius: 10px; }
    .civ-gift-info { flex: 1; }
    .civ-gift-name { font-size: 0.9rem; font-weight: 700; color: var(--c-text-1); margin: 0; }
    .civ-gift-req { font-size: 0.75rem; color: var(--c-text-4); margin: 0; }

    .civ-btn-gift {
      padding: 8px 14px; border-radius: 10px; border: none;
      background: var(--c-green); color: white; font-size: 0.8rem; font-weight: 700;
      cursor: pointer; transition: 0.2s;
    }
    .civ-btn-gift:disabled { background: var(--c-border); color: var(--c-text-4); cursor: not-allowed; }
    .civ-btn-gift:not(:disabled):hover { transform: scale(1.05); }

    .civ-history { padding: 0 16px 24px; }
  `]
})
export class ClientIdentityViewComponent implements OnInit {
  @Input({ required: true }) clientId!: string;
  @Input({ required: true }) clientName!: string;

  private rankSvc = inject(RankService);
  private toast = inject(ToastService);

  athleteRank = signal<AthleteRank | null>(null);
  fullRank = computed(() => {
    const ar = this.athleteRank();
    return ar ? this.rankSvc.calcFullRank(ar.xpTotal) : null;
  });

  // Datos de personalización del cliente (vendrían de la tabla profiles)
  bannerColor = signal('oceano');
  bannerPattern = signal('dots');
  equippedFrame = signal<string | null>('llama_eterna');

  unlockedFrames = signal<string[]>([]);

  grantableFrames = signal([
    { id: 'fav_coach', name: 'Favorito del Coach', emoji: '⭐', description: 'Reconocimiento manual por esfuerzo' },
    { id: 'mvp_month', name: 'MVP del Mes', emoji: '🏆', description: 'Otorgado al mejor atleta del mes' },
    { id: 'fire_soul', name: 'Alma de Fuego', emoji: '🔥', description: 'Por constancia inquebrantable' }
  ]);

  initials = computed(() => {
    return this.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });

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

  rankFrameColor = computed(() => this.fullRank()?.rank?.color ?? 'transparent');
  rankBadgeBg = computed(() => this.fullRank()?.rank ? `${this.fullRank()?.rank.color}33` : 'rgba(255,255,255,0.1)');

  frameCssClass = computed(() => {
    const frameId = this.equippedFrame();
    if (!frameId || frameId === 'none') return 'frame-none';
    const frame = getFrameById(frameId);
    return frame.cssClass;
  });

  xpToNextGoal = computed(() => {
    const xp = this.athleteRank()?.xpTotal || 0;
    return Math.max(0, 2000 - xp); // Objetivo: Zafiro (2000 XP)
  });

  goalProgress = computed(() => {
    const xp = this.athleteRank()?.xpTotal || 0;
    return Math.min(100, Math.round((xp / 2000) * 100));
  });

  hasFrame(id: string): boolean {
    return this.unlockedFrames().includes(id);
  }

  async ngOnInit() {
    this.loadClientIdentity();
  }

  async loadClientIdentity() {
    // Cargar rango
    const rank = await this.rankSvc.getAthleteRank(this.clientId);
    this.athleteRank.set(rank);

    // Cargar personalización y marcos desbloqueados
    const { data } = await supabase
      .from('profiles')
      .select('equipped_frame, banner_color, banner_pattern, unlocked_frames')
      .eq('id', this.clientId)
      .single();

    if (data) {
      if (data.equipped_frame) this.equippedFrame.set(data.equipped_frame);
      if (data.banner_color) this.bannerColor.set(data.banner_color);
      if (data.banner_pattern) this.bannerPattern.set(data.banner_pattern);
      this.unlockedFrames.set(data.unlocked_frames || []);
    }
  }

  async grantFrame(frameId: string, frameName: string) {
    const current = this.unlockedFrames();
    if (current.includes(frameId)) return;

    const newList = [...current, frameId];
    
    const { error } = await supabase
      .from('profiles')
      .update({ unlocked_frames: newList })
      .eq('id', this.clientId);

    if (!error) {
      this.unlockedFrames.set(newList);
      this.toast.success('¡Premio otorgado!', `${this.clientName} ha recibido el marco "${frameName}".`);
    } else {
      this.toast.error('Error', 'No se pudo otorgar el premio en este momento.');
    }
  }

  sendMotivation() {
    this.toast.success('¡Motivación enviada!', `${this.clientName} recibirá un push con tu apoyo.`);
  }

  viewActivity() {
    console.log('Viendo actividad...');
  }
}
