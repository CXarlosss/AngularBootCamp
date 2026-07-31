/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useAnalyticsSession — Trackea sesiones y abandono
 * Se monta en App.tsx y gestiona el ciclo de vida automáticamente
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '@/core/services/analyticsService';
import { useConfigStore } from '@/core/stores/configStore';

export function useAnalyticsSession(userId: string, therapistId?: string) {
  const sessionStarted = useRef(false);
  const lastActivity = useRef(Date.now());
  const inactivityTimeout = useRef<ReturnType<typeof setTimeout>>();
  const childMode = useConfigStore((s) => s.accessibility.childMode ?? false);

  // Inicializar analytics
  useEffect(() => {
    analytics.init(userId, { childMode, therapistId });
  }, [userId, therapistId, childMode]);

  // Detectar inactividad (abandono)
  const resetInactivityTimer = useCallback(() => {
    lastActivity.current = Date.now();
    clearTimeout(inactivityTimeout.current);
    
    inactivityTimeout.current = setTimeout(() => {
      const idleTime = Date.now() - lastActivity.current;
      if (idleTime > 5 * 60 * 1000) { // 5 minutos sin interacción
        analytics.endSession();
        sessionStarted.current = false;
      }
    }, 5 * 60 * 1000);
  }, []);

  useEffect(() => {
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      clearTimeout(inactivityTimeout.current);
    };
  }, [resetInactivityTimer]);

  // Iniciar sesión cuando la app se enfoca
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !sessionStarted.current) {
        analytics.startSession(crypto.randomUUID());
        sessionStarted.current = true;
      } else if (document.visibilityState === 'hidden') {
        // No cerramos inmediatamente, puede ser cambio de pestaña
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility(); // Iniciar si ya es visible

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      analytics.endSession();
    };
  }, []);
}
