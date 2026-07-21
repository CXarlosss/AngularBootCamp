import posthog from 'posthog-js';

/**
 * Servicio centralizado para el rastreo de analíticas (PostHog).
 * Envuelve las llamadas para estandarizar nombres de eventos y propiedades,
 * protegiendo la privacidad (PHI) y evitando capturar datos automáticos.
 */
class PostHogService {
  private get isEnabled(): boolean {
    return typeof posthog !== 'undefined' && (posthog as any).__loaded;
  }

  identifyPlayer(playerId: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    posthog.identify(playerId, properties);
  }

  trackWayStarted(levelId: string, stepId: string, wayId: string, isHomework: boolean) {
    if (!this.isEnabled) return;
    posthog.capture('way_started', { levelId, stepId, wayId, isHomework });
  }

  trackWayCompleted(levelId: string, stepId: string, wayId: string, durationSecs: number, isHomework: boolean, success: boolean) {
    if (!this.isEnabled) return;
    posthog.capture('way_completed', { levelId, stepId, wayId, durationSecs, isHomework, success });
  }

  trackRewardEarned(amount: number, reason: string) {
    if (!this.isEnabled) return;
    posthog.capture('reward_earned', { amount, reason });
  }

  trackItemPurchased(itemId: string, cost: number) {
    if (!this.isEnabled) return;
    posthog.capture('item_purchased', { itemId, cost });
  }

  trackSessionEnd(reason: string, durationSecs: number) {
    if (!this.isEnabled) return;
    posthog.capture('session_ended', { reason, durationSecs });
  }
}

export const posthogTracker = new PostHogService();
