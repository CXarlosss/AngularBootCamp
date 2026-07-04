import posthog from 'posthog-js';

/**
 * Servicio centralizado para Analytics Global (PostHog).
 * Diseñado para proteger la privacidad del paciente (sin enviar nombres reales).
 */
export const globalAnalytics = {
  identifyUser: (userId: string, isTherapist: boolean = false) => {
    // Usamos el UUID de Supabase, que es anónimo para PostHog
    posthog.identify(userId, {
      isTherapist,
    });
  },

  reset: () => {
    posthog.reset();
  },

  trackWayStarted: (wayId: string, category: string) => {
    posthog.capture('way_started', {
      wayId,
      category,
    });
  },

  trackWayCompleted: (wayId: string, category: string, durationSeconds: number, attempts: number) => {
    posthog.capture('way_completed', {
      wayId,
      category,
      durationSeconds,
      attempts,
    });
  },

  trackWayAbandoned: (wayId: string, timeSpentSeconds: number) => {
    posthog.capture('way_abandoned', {
      wayId,
      timeSpentSeconds,
    });
  },

  trackDailyChestOpened: (coinsEarned: number, currentStreak: number) => {
    posthog.capture('daily_chest_opened', {
      coinsEarned,
      currentStreak,
    });
  },

  trackZenModePlayed: (durationSeconds: number) => {
    posthog.capture('zen_mode_played', {
      durationSeconds,
    });
  },

  trackScreenView: (screenName: string) => {
    posthog.capture('$pageview', {
      $current_url: screenName
    });
  }
};
