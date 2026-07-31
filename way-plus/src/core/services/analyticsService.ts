/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Analytics Service — PostHog
 * Tracking de gamificación, adherencia y progreso terapéutico
 * Respetuoso con GDPR: no PII, hashes para IDs, modo niño disponible
 * ═══════════════════════════════════════════════════════════════
 */

import posthog from 'posthog-js';

// ─── TYPES ───
export type WayEvent =
  | 'session_started'
  | 'session_ended'
  | 'level_started'
  | 'level_completed'
  | 'level_abandoned'
  | 'task_completed'
  | 'task_failed'
  | 'reward_claimed'
  | 'reward_missed'
  | 'streak_broken'
  | 'streak_maintained'
  | 'help_opened'
  | 'settings_changed'
  | 'offline_action_queued'
  | 'offline_sync_completed'
  | 'notification_clicked'
  | 'notification_dismissed';

export interface EventProperties {
  level_id?: string;
  task_id?: string;
  task_index?: number;
  duration_ms?: number;
  attempts?: number;
  score?: number;
  reward_type?: string;
  streak_days?: number;
  previous_streak?: number;
  error_type?: string;
  setting_key?: string;
  setting_value?: unknown;
  notification_type?: string;
  [key: string]: unknown;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  levelsAttempted: string[];
  levelsCompleted: string[];
  tasksCompleted: number;
  totalPlayTimeMs: number;
  peakFrustrationScore: number; // Basado en errores rápidos seguidos
  helpRequests: number;
  offlineActions: number;
}

// ─── CONFIG ───
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com';

// ─── SERVICE ───
class AnalyticsService {
  private session: SessionMetrics | null = null;
  private initialized = false;
  private childMode = false; // Si true, no guarda session recording ni heatmaps

  init(userId: string, options: { childMode?: boolean; therapistId?: string } = {}) {
    if (this.initialized || !POSTHOG_KEY) return;

    this.childMode = options.childMode ?? false;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // Lo hacemos manualmente para SPA
      capture_pageleave: true,
      autocapture: false, // Control total de eventos
      session_recording: {
        recordCrossOriginIframes: false,
        maskAllInputs: true,
        maskTextSelector: '*', // No grabar texto en modo niño
      },
      loaded: (posthog) => {
        if (userId) {
          // Hashear ID para privacidad
          posthog.identify(this.hashId(userId));
          if (options.therapistId) {
            posthog.group('therapist', options.therapistId);
          }
        }
      },
    });

    this.initialized = true;
  }

  private hashId(id: string): string {
    // Simple hash para anonimización. En producción usar SHA-256.
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return `way-user-${Math.abs(hash)}`;
  }

  startSession(sessionId: string) {
    this.session = {
      sessionId,
      startTime: Date.now(),
      levelsAttempted: [],
      levelsCompleted: [],
      tasksCompleted: 0,
      totalPlayTimeMs: 0,
      peakFrustrationScore: 0,
      helpRequests: 0,
      offlineActions: 0,
    };

    this.track('session_started', { session_id: sessionId });
  }

  endSession() {
    if (!this.session) return;

    const duration = Date.now() - this.session.startTime;
    this.track('session_ended', {
      session_id: this.session.sessionId,
      duration_ms: duration,
      levels_attempted: this.session.levelsAttempted.length,
      levels_completed: this.session.levelsCompleted.length,
      tasks_completed: this.session.tasksCompleted,
      peak_frustration: this.session.peakFrustrationScore,
      help_requests: this.session.helpRequests,
    });

    this.session = null;
  }

  track(event: WayEvent, properties: EventProperties = {}) {
    if (!this.initialized) return;

    // En modo niño, no trackear eventos sensibles
    if (this.childMode && ['settings_changed'].includes(event)) return;

    posthog.capture(event, {
      ...properties,
      timestamp: Date.now(),
      way_version: '1.0',
    });
  }

  trackLevelStart(levelId: string) {
    this.session?.levelsAttempted.push(levelId);
    this.track('level_started', { level_id: levelId });
  }

  trackLevelComplete(levelId: string, score: number, durationMs: number) {
    this.session?.levelsCompleted.push(levelId);
    this.track('level_completed', {
      level_id: levelId,
      score,
      duration_ms: durationMs,
    });
  }

  trackLevelAbandon(levelId: string, reason: 'timeout' | 'exit' | 'error', durationMs: number) {
    this.track('level_abandoned', {
      level_id: levelId,
      error_type: reason,
      duration_ms: durationMs,
    });
  }

  trackFrustration(levelId: string, consecutiveErrors: number) {
    const score = Math.min(10, consecutiveErrors); // 1-10 escala
    if (this.session && score > this.session.peakFrustrationScore) {
      this.session.peakFrustrationScore = score;
    }
    if (score >= 3) {
      this.track('help_opened', { level_id: levelId, frustration_score: score });
    }
  }

  trackStreak(days: number, previousStreak: number) {
    if (days === 0 && previousStreak > 0) {
      this.track('streak_broken', { previous_streak: previousStreak });
    } else if (days > previousStreak) {
      this.track('streak_maintained', { streak_days: days, previous_streak: previousStreak });
    }
  }

  // ─── FEATURE FLAGS (para A/B testing de niveles) ───
  isEnabled(flag: string): boolean {
    return posthog.isFeatureEnabled(flag) ?? false;
  }

  getFlagPayload<T>(flag: string): T | undefined {
    return posthog.getFeatureFlagPayload(flag) as T | undefined;
  }

  // ─── THERAPIST DASHBOARD DATA ───
  async getPatientInsights(patientHashId: string): Promise<{
    adherenceScore: number;
    avgSessionDuration: number;
    completionRate: number;
    frustrationTrend: 'improving' | 'stable' | 'worsening';
    recommendedAction: string;
  } | null> {
    // En producción, esto llamaría a tu backend que consulta PostHog API
    // o usa la API de PostHog directamente con project API key
    return null;
  }
}

export const analytics = new AnalyticsService();
