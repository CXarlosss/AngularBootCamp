import { Injectable, inject } from '@angular/core';
import { FeedbackService } from './feedback.service';

export type FrameRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

@Injectable({ providedIn: 'root' })
export class FrameCelebrationService {
  private readonly feedback = inject(FeedbackService);

  /** Dispara la celebración completa al equipar un marco */
  celebrateEquip(frameId: string, rarity: FrameRarity, isNewUnlock: boolean = false): void {
    // 1. Sonido según rareza
    this.playRaritySound(rarity);

    // 2. Vibración
    this.feedback.vibrate(rarity === 'legendary' ? 'prCelebration' : 'medium');

    // 3. Animación de flash en el preview
    this.triggerFlashAnimation();

    // 4. Confetti (solo para raro, épico, legendario)
    if (['rare', 'epic', 'legendary'].includes(rarity)) {
      this.spawnConfetti(rarity);
    }

    // 5. Rayos de luz (solo legendario)
    if (rarity === 'legendary') {
      this.triggerLightRays();
    }

    // 6. Si es desbloqueo nuevo, celebración extra
    if (isNewUnlock) {
      setTimeout(() => this.feedback.playSound('levelUp'), 300);
    }
  }

  /** Sonido diferente según rareza */
  private playRaritySound(rarity: FrameRarity): void {
    switch (rarity) {
      case 'common':
        this.feedback.playSound('click');
        break;
      case 'uncommon':
        this.feedback.playSound('success');
        break;
      case 'rare':
        this.feedback.playSound('success');
        break;
      case 'epic':
        this.feedback.playSound('levelUp');
        break;
      case 'legendary':
        this.feedback.celebrate(); // Fanfarria + vibración celebración
        break;
    }
  }

  /** Activa el flash de absorción en el preview */
  private triggerFlashAnimation(): void {
    const preview = document.querySelector('.frame-preview-container');
    if (!preview) return;

    preview.classList.remove('celebrating');
    void (preview as HTMLElement).offsetWidth; // force reflow
    preview.classList.add('celebrating');

    setTimeout(() => preview.classList.remove('celebrating'), 1000);
  }

  /** Spawnea confetti CSS puro */
  private spawnConfetti(rarity: FrameRarity): void {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = this.getConfettiColors(rarity);
    const pieceCount = rarity === 'legendary' ? 40 : rarity === 'epic' ? 25 : 15;

    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement('div');
      piece.className = `confetti-piece ${colors[i % colors.length]}`;
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDuration = `${2 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.width = `${6 + Math.random() * 6}px`;
      piece.style.height = piece.style.width;
      container.appendChild(piece);
    }

    // Limpiar después de la animación
    setTimeout(() => container.remove(), 4500);
  }

  private getConfettiColors(rarity: FrameRarity): string[] {
    switch (rarity) {
      case 'legendary': return ['confetti-gold', 'confetti-purple', 'confetti-red'];
      case 'epic': return ['confetti-purple', 'confetti-cyan'];
      case 'rare': return ['confetti-cyan'];
      default: return ['confetti-gold'];
    }
  }

  /** Activa rayos de luz (legendario) */
  private triggerLightRays(): void {
    const preview = document.querySelector('.frame-preview-container');
    if (!preview) return;

    const rays = document.createElement('div');
    rays.className = 'light-rays active';
    preview.appendChild(rays);

    setTimeout(() => rays.remove(), 1000);
  }

  /** Activa animación de candado rompiéndose */
  triggerLockBreak(element: HTMLElement): void {
    element.classList.add('frame-lock-break');
    setTimeout(() => element.classList.remove('frame-lock-break'), 600);
  }
}
