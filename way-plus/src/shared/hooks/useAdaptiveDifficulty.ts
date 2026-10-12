/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useAdaptiveDifficulty — Hook de IA adaptativa
 * Conecta el detector de frustración con el motor de ajuste
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { frustrationDetector, type InteractionEvent, type FrustrationMetrics } from '@/core/services/frustrationDetector';
import { adaptiveEngine, type AdaptationResult, type LevelParameters } from '@/core/services/adaptiveEngine';
import { hapticService } from '@/core/services/hapticService';
import { analytics } from '@/core/services/analyticsService';

export interface AdaptiveState {
  frustration: FrustrationMetrics | null;
  lastAdaptation: AdaptationResult | null;
  currentParams: LevelParameters;
  isMonitoring: boolean;
  totalAdaptations: number;
}

export function useAdaptiveDifficulty(baseParams?: Partial<LevelParameters>) {
  const [state, setState] = useState<AdaptiveState>({
    frustration: null,
    lastAdaptation: null,
    currentParams: adaptiveEngine.getCurrentParams(),
    isMonitoring: false,
    totalAdaptations: 0,
  });

  const monitorInterval = useRef<ReturnType<typeof setInterval>>();

  const startMonitoring = useCallback(() => {
    adaptiveEngine.reset(baseParams);
    frustrationDetector.reset();
    setState({
      frustration: null,
      lastAdaptation: null,
      currentParams: adaptiveEngine.getCurrentParams(),
      isMonitoring: true,
      totalAdaptations: 0,
    });

    // Analizar cada 3 segundos
    monitorInterval.current = setInterval(() => {
      const metrics = frustrationDetector.analyze();
      if (metrics.level !== 'calm') {
        const result = adaptiveEngine.adapt(metrics);

        if (result.action !== 'none') {
          setState((prev) => ({
            ...prev,
            frustration: metrics,
            lastAdaptation: result,
            currentParams: result.parameters,
            totalAdaptations: prev.totalAdaptations + 1,
          }));

          // Haptic según recomendación
          if (result.hapticPattern === 'encourage') hapticService.success();
          if (result.hapticPattern === 'calm') hapticService.click();

          // Analytics: trackear intervención del AI
          analytics.track('ai_intervention', {
            action: result.action,
            frustration_score: metrics.score,
            triggers: metrics.triggers,
          });
        } else {
          setState((prev) => ({ ...prev, frustration: metrics }));
        }
      }
    }, 3000);
  }, [baseParams]);

  const stopMonitoring = useCallback(() => {
    if (monitorInterval.current) clearInterval(monitorInterval.current);
    setState((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  const recordInteraction = useCallback((event: Omit<InteractionEvent, 'timestamp'>) => {
    frustrationDetector.record({
      ...event,
      timestamp: Date.now(),
    });
  }, []);

  const recordError = useCallback(() => {
    recordInteraction({ type: 'error' });
  }, [recordInteraction]);

  const recordSuccess = useCallback(() => {
    recordInteraction({ type: 'tap' }); // tap exitoso
  }, [recordInteraction]);

  const recordHelp = useCallback(() => {
    recordInteraction({ type: 'help' });
  }, [recordInteraction]);

  // Cleanup
  useEffect(() => {
    return () => stopMonitoring();
  }, [stopMonitoring]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    recordInteraction,
    recordError,
    recordSuccess,
    recordHelp,
  };
}
