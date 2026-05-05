// src/app/shared/components/unlock-celebration/unlock-celebration.component.ts

import { Component, ElementRef, ViewChild, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnlockCelebrationService } from '../../services/unlock-celebration/unlock-celebration.service';

@Component({
  selector: 'app-unlock-celebration',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (svc.activeUnlock(); as item) {
      <div class="uc-overlay" (click)="close()">
        <!-- Canvas para el confetti -->
        <canvas #confettiCanvas class="uc-canvas"></canvas>

        <div class="uc-modal" (click)="$event.stopPropagation()">
          <div class="uc-glow" [attr.data-rarity]="item.rarity || 'common'"></div>
          
          <div class="uc-header">
            <span class="uc-stars">✨✨✨</span>
            <h2 class="uc-title">¡NUEVO DESBLOQUEO!</h2>
            <span class="uc-stars">✨✨✨</span>
          </div>

          <!-- Item Animado -->
          <div class="uc-item-wrap">
            <div class="uc-item-ring"></div>
            <div class="uc-item-preview">
              <span class="uc-emoji">{{ item.emoji }}</span>
            </div>
            <div class="uc-item-shine"></div>
          </div>

          <div class="uc-info">
            <span class="uc-rarity" [attr.data-rarity]="item.rarity || 'common'">
              {{ (item.rarity || 'nuevo') | uppercase }}
            </span>
            <h3 class="uc-item-name">{{ item.name }}</h3>
            <p class="uc-desc">{{ item.description || 'Se ha añadido a tu colección' }}</p>
          </div>

          <div class="uc-actions">
            <button class="uc-btn-primary" (click)="equip()">
              🎨 Equipar ahora
            </button>
            <button class="uc-btn-ghost" (click)="close()">
              Ver más tarde
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .uc-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.4s ease-out;
    }

    .uc-canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .uc-modal {
      position: relative;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 32px;
      width: 100%;
      max-width: 400px;
      padding: 40px 24px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: modalSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    .uc-glow {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 300px; height: 300px;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.2;
      z-index: 0;
      pointer-events: none;
    }
    .uc-glow[data-rarity="common"] { background: var(--c-green); }
    .uc-glow[data-rarity="rare"] { background: #3b82f6; }
    .uc-glow[data-rarity="epic"] { background: #8b5cf6; }
    .uc-glow[data-rarity="legendary"] { background: #fbbf24; }

    .uc-header {
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }

    .uc-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 3px;
      color: var(--c-text-1);
      margin: 10px 0;
    }

    .uc-stars {
      color: #fbbf24;
      font-size: 12px;
    }

    /* ===== ITEM ANIMADO ===== */
    .uc-item-wrap {
      position: relative;
      width: 160px; height: 160px;
      margin: 0 auto 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .uc-item-preview {
      width: 100px; height: 100px;
      background: var(--c-bg);
      border: 2px solid var(--c-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: rotate3d 4s linear infinite;
    }

    .uc-emoji {
      font-size: 60px;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
    }

    .uc-item-ring {
      position: absolute;
      inset: 10px;
      border: 2px dashed var(--c-green-glow);
      border-radius: 50%;
      animation: spin 10s linear infinite;
      opacity: 0.5;
    }

    .uc-item-shine {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
      animation: pulse 2s ease-in-out infinite;
    }

    /* ===== INFO ===== */
    .uc-info {
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .uc-rarity {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
      display: inline-block;
      background: rgba(255,255,255,0.05);
      border: 0.5px solid var(--c-border);
    }
    .uc-rarity[data-rarity="legendary"] { color: #fbbf24; border-color: rgba(251,191,36,0.3); }
    .uc-rarity[data-rarity="epic"] { color: #a78bfa; border-color: rgba(167,139,250,0.3); }

    .uc-item-name {
      font-size: 28px;
      font-weight: 800;
      color: var(--c-text-1);
      margin: 0 0 8px;
    }

    .uc-desc {
      font-size: 14px;
      color: var(--c-text-3);
      line-height: 1.6;
    }

    /* ===== ACTIONS ===== */
    .uc-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .uc-btn-primary {
      padding: 16px;
      border-radius: 16px;
      border: none;
      background: var(--c-green);
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .uc-btn-primary:hover { transform: scale(1.02); filter: brightness(1.1); }

    .uc-btn-ghost {
      padding: 12px;
      background: transparent;
      border: none;
      color: var(--c-text-4);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .uc-btn-ghost:hover { color: var(--c-text-2); }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { 
      from { opacity: 0; transform: translateY(50px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes rotate3d {
      0% { transform: perspective(400px) rotateY(0deg); }
      50% { transform: perspective(400px) rotateY(180deg); }
      100% { transform: perspective(400px) rotateY(360deg); }
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { transform: scale(0.8); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.6; } }
  `]
})
export class UnlockCelebrationComponent {
  @ViewChild('confettiCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  svc = inject(UnlockCelebrationService);

  private particles: any[] = [];
  private animationId: number | null = null;

  constructor() {
    // Escuchar cambios para disparar el confetti
    effect(() => {
      if (this.svc.activeUnlock()) {
        setTimeout(() => this.initConfetti(), 100);
      } else {
        this.stopConfetti();
      }
    });
  }

  close() {
    this.svc.dismiss();
  }

  equip() {
    // Aquí podrías emitir un evento o llamar a una función de equipamiento
    this.close();
  }

  private initConfetti() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.particles = [];
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#fbbf24', '#ef4444'];

    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 6.28,
        rotation: Math.random() * 0.2 - 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(p.angle) * 2;
        p.angle += p.rotation;

        if (p.y > canvas.height) p.y = -20;

        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private stopConfetti() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}
