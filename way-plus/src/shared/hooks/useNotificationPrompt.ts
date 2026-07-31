/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useNotificationPrompt — Pide permiso en el momento justo
 * Nunca al inicio. Solo después de una victoria o logro.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '@/core/services/notificationService';
import { hapticService } from '@/core/services/hapticService';

export function useNotificationPrompt() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(Notification.permission);
      setCanPrompt(Notification.permission === 'default');
    }
  }, []);

  const promptAfterWin = useCallback(async () => {
    if (!canPrompt || !notificationService.isSupported()) return false;
    
    // Solo pedimos después de un logro positivo (contexto emocional alto)
    hapticService.success();
    
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    setCanPrompt(false);
    
    if (granted) {
      // Programar recordatorio diario a las 16:00 (después del colegio)
      notificationService.scheduleDailyReminder(16, 0);
      // Y recordatorio de racha a los 2 días
      notificationService.scheduleStreakReminder(2);
    }
    
    return granted;
  }, [canPrompt]);

  return {
    permission,
    canPrompt,
    promptAfterWin,
    isSupported: notificationService.isSupported(),
  };
}
