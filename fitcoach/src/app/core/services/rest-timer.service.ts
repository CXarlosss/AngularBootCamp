import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RestTimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  remaining  = signal(0);
  total      = signal(0);
  isRunning  = signal(false);

  progress = computed(() =>
    this.total() > 0
      ? Math.round(((this.total() - this.remaining()) / this.total()) * 100)
      : 0
  );

  start(seconds: number): void {
    this.stop();
    this.total.set(seconds);
    this.remaining.set(seconds);
    this.isRunning.set(true);

    this.intervalId = setInterval(() => {
      this.remaining.update(r => {
        if (r <= 1) {
          this.finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  skip(): void { this.finish(); }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning.set(false);
  }

  private finish(): void {
    this.stop();
    this.remaining.set(0);
    // Vibración en móvil al terminar el descanso
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
