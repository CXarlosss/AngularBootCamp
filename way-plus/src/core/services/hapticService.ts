type HapticConfig = {
  enabled: boolean;
  respectReducedMotion: boolean;
};

class HapticService {
  private config: HapticConfig = {
    enabled: true,
    respectReducedMotion: true,
  };

  private get prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  isSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'vibrate' in navigator;
  }

  isActive(): boolean {
    if (!this.config.enabled) return false;
    if (this.config.respectReducedMotion && this.prefersReducedMotion) return false;
    return this.isSupported();
  }

  setConfig(newConfig: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): HapticConfig {
    return { ...this.config };
  }

  trigger(pattern: number | number[]): void {
    if (!this.isActive()) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Fallback silent
    }
  }

  click(): void {
    // Light tap
    this.trigger(10);
  }

  success(): void {
    // Two quick taps
    this.trigger([10, 50, 20]);
  }

  error(): void {
    // Heavy vibration
    this.trigger([50, 100, 50]);
  }

  celebration(): void {
    // Rhythmic pattern
    this.trigger([20, 50, 20, 50, 20, 50, 50]);
  }

  milestone(): void {
    // Long then quick pulses
    this.trigger([100, 50, 30, 50, 30]);
  }
}

export const hapticService = new HapticService();
