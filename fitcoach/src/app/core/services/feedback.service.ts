import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  vibrate(type: string): void {
    if ('vibrate' in navigator) {
      if (type === 'prCelebration') navigator.vibrate([100, 50, 100, 50, 100]);
      else if (type === 'medium') navigator.vibrate(100);
      else navigator.vibrate(50);
    }
  }

  playSound(type: string): void {
    // Stub for playing sound
    console.log(`[Feedback] Playing sound: ${type}`);
  }

  celebrate(): void {
    this.playSound('celebration');
    this.vibrate('prCelebration');
  }
}
