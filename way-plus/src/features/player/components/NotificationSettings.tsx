import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { notificationService } from '@/core/services/notificationService';
import { Button } from '@/shared/components/Button';

export const NotificationSettings = () => {
  const [enabled, setEnabled] = useState(notificationService.isGranted());
  const [dailyHour, setDailyHour] = useState(16);

  const handleToggle = async () => {
    if (!enabled) {
      const granted = await notificationService.requestPermission();
      setEnabled(granted);
      if (granted) {
        notificationService.scheduleDailyReminder(dailyHour);
      }
    } else {
      notificationService.cancelAll();
      setEnabled(false);
    }
  };

  return (
    <div className={way(GLASS.card, 'rounded-2xl p-5')}>
      <h3 className={TEXT.subtitle}>🔔 Recordatorios</h3>
      <p className={way(TEXT.micro, 'mt-1 mb-4')}>
        Te avisaremos amigablemente para que no pierdas tu racha de juego.
      </p>

      <label className="flex items-center justify-between mb-4">
        <span className={TEXT.label}>Activar recordatorios</span>
        <button
          className={way(
            'relative h-7 w-12 rounded-full transition-colors',
            enabled ? 'bg-indigo-500' : 'bg-slate-300'
          )}
          onClick={handleToggle}
          aria-pressed={enabled}
          type="button"
        >
          <span
            className={way(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </label>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <label className={way(TEXT.label, 'block mb-2')}>
              Hora del recordatorio diario
            </label>
            <input
              type="time"
              value={`${dailyHour.toString().padStart(2, '0')}:00`}
              onChange={(e) => {
                const hour = parseInt(e.target.value.split(':')[0], 10);
                setDailyHour(hour);
                notificationService.cancel('daily-reminder');
                notificationService.scheduleDailyReminder(hour);
              }}
              className={way(
                'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50'
              )}
            />
            <p className={way(TEXT.micro, 'mt-2')}>
              Te enviaremos un mensaje amigable a esta hora si no has jugado.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
