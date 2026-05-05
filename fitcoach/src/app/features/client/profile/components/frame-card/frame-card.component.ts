// src/app/features/client/profile/components/frame-card/frame-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FrameDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  animation: 'flame' | 'gold' | 'emerald' | 'silver' | 'pulse' | 'none';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

@Component({
  selector: 'app-frame-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fc-card"
      [class.fc-equipped]="isEquipped"
      [class.fc-locked]="!isUnlocked"
      [class.fc-unlocked]="isUnlocked && !isEquipped"
      [attr.data-animation]="frame.animation"
      tabindex="0"
      (click)="onClick()"
      (keydown.enter)="onClick()">

      <!-- Ribbon "ACTIVO" -->
      @if (isEquipped) {
        <div class="fc-ribbon">ACTIVO</div>
      }

      <!-- Visual del anillo -->
      <div class="fc-visual">
        <div class="fc-ring" [class]="'fc-ring-' + frame.animation">
          <div class="fc-ring-inner"></div>
          <div class="fc-ring-glow"></div>
        </div>
        <span class="fc-emoji">{{ frame.emoji }}</span>
        
        <!-- Partículas decorativas (solo equipado) -->
        @if (isEquipped) {
          <div class="fc-particles">
            @for (i of [1,2,3,4,5]; track i) {
              <span class="fc-particle" [style.--i]="i"></span>
            }
          </div>
        }
      </div>

      <!-- Info -->
      <div class="fc-info">
        <h4 class="fc-name">{{ frame.name }}</h4>
        <p class="fc-desc">{{ frame.description }}</p>
      </div>

      <!-- Requisito / Progreso -->
      @if (!isUnlocked) {
        <div class="fc-lock-section">
          <div class="fc-progress-track">
            <div class="fc-progress-fill" [style.width.%]="progress ?? 0"></div>
          </div>
          <span class="fc-progress-label">{{ lockLabel() }}</span>
        </div>
      }

      <!-- Botón de acción -->
      <button
        class="fc-btn"
        [class.fc-btn-equipped]="isEquipped"
        [class.fc-btn-equip]="isUnlocked && !isEquipped"
        [class.fc-btn-locked]="!isUnlocked"
        [disabled]="!isUnlocked"
        (click)="$event.stopPropagation(); onAction()">
        @if (isEquipped) {
          <span>✓ Equipado</span>
        } @else if (isUnlocked) {
          <span>Equipar</span>
        } @else {
          <span>🔒 Bloqueado</span>
        }
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .fc-card {
      position: relative;
      background: var(--c-surface);
      border: 0.5px solid var(--c-border);
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      transform-style: preserve-3d;
      box-shadow: var(--c-shadow);
    }

    .fc-card:hover:not(.fc-locked) {
      transform: translateY(-5px) rotateX(2deg);
      border-color: var(--c-border-hover);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }

    .fc-card:focus-visible {
      outline: 2px solid var(--c-green);
      outline-offset: 3px;
    }

    /* ===== EQUIPPED STATE ===== */
    .fc-equipped {
      border-color: rgba(251,191,36,0.3);
      background: linear-gradient(180deg, var(--c-surface), rgba(251,191,36,0.03));
      box-shadow: 0 0 30px rgba(251,191,36,0.08), 0 8px 24px rgba(0,0,0,0.3);
    }

    .fc-ribbon {
      position: absolute;
      top: 14px;
      right: -30px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #000;
      font-size: 9px;
      font-weight: 900;
      padding: 5px 32px;
      transform: rotate(45deg);
      letter-spacing: 1.5px;
      box-shadow: 0 2px 8px rgba(251,191,36,0.3);
      z-index: 10;
    }

    /* ===== VISUAL ===== */
    .fc-visual {
      width: 90px;
      height: 90px;
      margin: 0 auto 20px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fc-emoji {
      font-size: 2.6rem;
      z-index: 3;
      position: relative;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
      transition: transform 0.3s;
    }

    .fc-card:hover .fc-emoji {
      transform: scale(1.1);
    }

    /* ===== RING SYSTEM ===== */
    .fc-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;
    }

    .fc-ring-inner {
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .fc-ring-glow {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.4s;
    }

    .fc-card:hover .fc-ring-glow {
      opacity: 1;
    }

    /* --- FLAME (Llama Eterna) --- */
    .fc-ring-flame {
      border-color: #ef4444;
      box-shadow: 0 0 20px rgba(239,68,68,0.2), inset 0 0 10px rgba(239,68,68,0.05);
    }
    .fc-ring-flame .fc-ring-glow {
      box-shadow: 0 0 30px rgba(239,68,68,0.3);
      animation: flamePulse 2s ease-in-out infinite;
    }
    @keyframes flamePulse {
      0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.2); opacity: 0.6; }
      50% { box-shadow: 0 0 40px rgba(239,68,68,0.4); opacity: 1; }
    }

    /* --- GOLD (Récord Olímpico) --- */
    .fc-ring-gold {
      border-color: #fbbf24;
      border-style: double;
      border-width: 4px;
      box-shadow: 0 0 20px rgba(251,191,36,0.2);
    }
    .fc-ring-gold .fc-ring-glow {
      box-shadow: 0 0 30px rgba(251,191,36,0.25);
      animation: goldPulse 3s ease-in-out infinite;
    }
    @keyframes goldPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }

    /* --- EMERALD (Tribuno) --- */
    .fc-ring-emerald {
      border-color: #10b981;
      box-shadow: 0 0 20px rgba(16,185,129,0.2);
    }
    .fc-ring-emerald .fc-ring-glow {
      box-shadow: 0 0 30px rgba(16,185,129,0.3);
      animation: emeraldShine 4s ease-in-out infinite;
    }
    @keyframes emeraldShine {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.9; }
    }

    /* --- SILVER (Centurión) --- */
    .fc-ring-silver {
      border-color: #c0c0c0;
      box-shadow: 0 0 15px rgba(192,192,192,0.15);
    }
    .fc-ring-silver .fc-ring-glow {
      box-shadow: 0 0 25px rgba(192,192,192,0.2);
    }

    /* --- PULSE (Semidiós) --- */
    .fc-ring-pulse {
      border-color: #fbbf24;
      animation: ringPulse 2s ease-in-out infinite;
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1); border-width: 3px; }
      50% { transform: scale(1.03); border-width: 4px; }
    }
    .fc-ring-pulse .fc-ring-glow {
      box-shadow: 0 0 35px rgba(251,191,36,0.3);
      animation: glowPulse 2s ease-in-out infinite;
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    /* --- NONE (Recruta / default) --- */
    .fc-ring-none {
      border-color: rgba(255,255,255,0.08);
    }

    /* --- LOCKED --- */
    .fc-locked .fc-ring {
      border-color: rgba(255,255,255,0.06) !important;
      box-shadow: none !important;
      animation: none !important;
    }
    .fc-locked .fc-ring-glow {
      display: none;
    }
    .fc-locked .fc-emoji {
      opacity: 0.4;
      filter: grayscale(0.6);
    }

    /* ===== PARTICLES (equipped only) ===== */
    .fc-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .fc-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--c-green);
      top: 50%;
      left: 50%;
      opacity: 0;
      animation: particleFloat 3s ease-in-out infinite;
      animation-delay: calc(var(--i) * 0.6s);
    }

    @keyframes particleFloat {
      0% {
        transform: translate(-50%, -50%) rotate(0deg) translateX(45px) rotate(0deg);
        opacity: 0;
      }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% {
        transform: translate(-50%, -50%) rotate(360deg) translateX(45px) rotate(-360deg);
        opacity: 0;
      }
    }

    /* ===== INFO ===== */
    .fc-info {
      margin-bottom: 16px;
    }

    .fc-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--c-text-1);
      margin: 0 0 6px;
    }

    .fc-desc {
      font-size: 12px;
      color: var(--c-text-3);
      line-height: 1.5;
      margin: 0;
      min-height: 36px;
    }

    /* ===== LOCK SECTION ===== */
    .fc-lock-section {
      margin-bottom: 16px;
    }

    .fc-progress-track {
      height: 6px;
      background: var(--c-bg);
      border-radius: 6px;
      overflow: hidden;
      border: 0.5px solid var(--c-border);
    }

    .fc-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--c-green), #8b5cf6);
      border-radius: 6px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fc-progress-label {
      display: block;
      font-size: 11px;
      color: var(--c-text-4);
      margin-top: 8px;
      font-weight: 500;
    }

    /* ===== BUTTON ===== */
    .fc-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      border: none;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fc-btn-equip {
      background: var(--c-green-t);
      color: var(--c-green);
      border: 0.5px solid var(--c-green-glow);
    }
    .fc-btn-equip:hover {
      background: var(--c-green);
      color: white;
      box-shadow: 0 4px 16px var(--c-green-glow);
      transform: translateY(-1px);
    }

    .fc-btn-equipped {
      background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06));
      color: #fbbf24;
      border: 0.5px solid rgba(251,191,36,0.2);
      cursor: default;
    }

    .fc-btn-locked {
      background: rgba(255,255,255,0.03);
      color: var(--c-text-4);
      border: 0.5px solid var(--c-border);
      cursor: not-allowed;
    }

    /* Hover en card locked */
    .fc-locked:hover {
      transform: none;
      border-color: var(--c-border);
    }
  `]
})
export class FrameCardComponent {
  @Input({ required: true }) frame!: FrameDef;
  @Input() isEquipped = false;
  @Input() isUnlocked = false;
  @Input() progress: number | null = null; // 0-100

  @Output() equip = new EventEmitter<string>();
  @Output() unequip = new EventEmitter<void>();

  lockLabel(): string {
    if (this.progress === null || this.progress === undefined) return this.frame.requirement;
    if (this.progress >= 100) return '¡Desbloqueado! Equípalo';
    if (this.progress === 0) return this.frame.requirement;
    return `${Math.round(this.progress)}% — ${this.frame.requirement}`;
  }

  onClick() {
    if (!this.isUnlocked) return;
    if (this.isEquipped) {
      this.unequip.emit();
    } else {
      this.equip.emit(this.frame.id);
    }
  }

  onAction() {
    if (!this.isUnlocked) return;
    if (this.isEquipped) {
      this.unequip.emit();
    } else {
      this.equip.emit(this.frame.id);
    }
  }
}
