/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ AdaptiveSettings — Panel del terapeuta para configurar IA
 * Activa/desactiva adaptación, ajusta umbrales, ve historial
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';

interface AdaptiveSettingsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  sensitivity: 'low' | 'medium' | 'high';
  onSensitivityChange: (s: 'low' | 'medium' | 'high') => void;
  interventionCount: number;
}

export const AdaptiveSettings: React.FC<AdaptiveSettingsProps> = ({
  isEnabled,
  onToggle,
  sensitivity,
  onSensitivityChange,
  interventionCount,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const sensitivityConfig = {
    low: { label: 'Baja', desc: 'Interviene solo en casos graves', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    medium: { label: 'Media', desc: 'Equilibrio entre apoyo y reto', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    high: { label: 'Alta', desc: 'Ajusta rápidamente ante cualquier señal', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  };

  return (
    <div className={way(GLASS.card, 'rounded-2xl p-5')}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={TEXT.subtitle}>🤖 IA Adaptativa</h3>
          <p className={way(TEXT.micro, 'text-slate-500')}>
            Ajusta automáticamente la dificultad según el estado emocional
          </p>
        </div>
        <button
          className={way(
            'relative h-7 w-12 rounded-full transition-colors',
            isEnabled ? 'bg-indigo-500' : 'bg-slate-300'
          )}
          onClick={() => {
            hapticService.click();
            onToggle(!isEnabled);
          }}
          aria-pressed={isEnabled}
          type="button"
        >
          <span
            className={way(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
              isEnabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {isEnabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="space-y-4"
        >
          {/* Sensitivity */}
          <div>
            <label className={way(TEXT.label, 'mb-2 block')}>Sensibilidad de detección</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((s) => (
                <button
                  key={s}
                  className={way(
                    'rounded-xl border-2 px-3 py-2 text-center text-sm transition-all',
                    sensitivity === s
                      ? way(sensitivityConfig[s].color, 'border-current')
                      : 'border-slate-200 bg-white/60 text-slate-600'
                  )}
                  onClick={() => {
                    hapticService.click();
                    onSensitivityChange(s);
                  }}
                >
                  <span className="block font-bold">{sensitivityConfig[s].label}</span>
                </button>
              ))}
            </div>
            <p className={way(TEXT.micro, 'mt-1 text-slate-500')}>
              {sensitivityConfig[sensitivity].desc}
            </p>
          </div>

          {/* Stats */}
          <div className={way(GLASS.cardSolid, 'rounded-xl p-3')}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Intervenciones esta sesión</span>
              <span className="text-lg font-bold text-indigo-600">{interventionCount}</span>
            </div>
          </div>

          {/* What it does */}
          <button
            className="flex w-full items-center justify-between text-sm text-indigo-600 underline underline-offset-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            ¿Qué hace la IA?
            <span>{showDetails ? '▲' : '▼'}</span>
          </button>

          {showDetails && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 text-sm text-slate-600"
            >
              <li className="flex gap-2">
                <span>👆</span>
                <span>Detecta toques erráticos o frenéticos</span>
              </li>
              <li className="flex gap-2">
                <span>❌</span>
                <span>Reconoce 3+ errores seguidos</span>
              </li>
              <li className="flex gap-2">
                <span>⏸️</span>
                <span>Identifica pausas de abandono</span>
              </li>
              <li className="flex gap-2">
                <span>✨</span>
                <span>Ajusta: tiempo, tamaño, distracciones, pistas</span>
              </li>
              <li className="flex gap-2">
                <span>🔒</span>
                <span>Todo el análisis es local (sin nube)</span>
              </li>
            </motion.ul>
          )}
        </motion.div>
      )}
    </div>
  );
};
