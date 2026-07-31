/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ TherapistInsights — Métricas de adherencia y progreso
 * Se inyecta en TherapistDashboard.tsx
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { rw, CONTAINER } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
import { BTN } from '@/shared/components/Button';

interface PatientInsight {
  patientId: string;
  name: string;
  avatar: string;
  adherenceScore: number; // 0-100
  avgSessionMinutes: number;
  completionRate: number; // 0-100
  lastSession: string;
  frustrationTrend: 'improving' | 'stable' | 'worsening';
  redFlags: string[];
}

export const TherapistInsights = () => {
  const [insights, setInsights] = useState<PatientInsight[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // En producción, esto vendría de tu API que consulta PostHog
  useEffect(() => {
    // Mock data representativa
    setInsights([
      {
        patientId: 'p1',
        name: 'Lucía M.',
        avatar: '👧',
        adherenceScore: 85,
        avgSessionMinutes: 12,
        completionRate: 78,
        lastSession: 'Hoy, 10:30',
        frustrationTrend: 'improving',
        redFlags: [],
      },
      {
        patientId: 'p2',
        name: 'Tomás G.',
        avatar: '👦',
        adherenceScore: 62,
        avgSessionMinutes: 8,
        completionRate: 45,
        lastSession: 'Ayer, 14:00',
        frustrationTrend: 'worsening',
        redFlags: ['Abandona en Nivel 3', '3 errores seguidos frecuentes'],
      },
      {
        patientId: 'p3',
        name: 'Sofía R.',
        avatar: '👧',
        adherenceScore: 45,
        avgSessionMinutes: 5,
        completionRate: 30,
        lastSession: 'Hace 3 días',
        frustrationTrend: 'worsening',
        redFlags: ['Sin sesión en 72h', 'Streak roto'],
      },
    ]);
  }, []);

  const getTrendColor = (trend: PatientInsight['frustrationTrend']) => {
    switch (trend) {
      case 'improving': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'stable': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'worsening': return 'text-rose-600 bg-rose-100 border-rose-200';
    }
  };

  const getTrendLabel = (trend: PatientInsight['frustrationTrend']) => {
    switch (trend) {
      case 'improving': return 'Mejorando';
      case 'stable': return 'Estable';
      case 'worsening': return 'Atención';
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className={TEXT.subtitle}>Análisis de adherencia</h2>
        <span className={way(TEXT.micro, 'text-slate-500')}>
          Actualizado en tiempo real
        </span>
      </div>

      <div className={way(rw('gridShop'), 'gap-3')}>
        {insights.map((patient, index) => (
          <motion.div
            key={patient.patientId}
            className={way(
              GLASS.card,
              'cursor-pointer rounded-2xl p-4 transition-all',
              selectedPatient === patient.patientId && 'ring-2 ring-indigo-500'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => {
              hapticService.click();
              setSelectedPatient(
                selectedPatient === patient.patientId ? null : patient.patientId
              );
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                {patient.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
                <p className={TEXT.micro}>{patient.lastSession}</p>
              </div>
              <span className={way(
                'rounded-full px-2.5 py-0.5 text-xs font-bold border',
                getTrendColor(patient.frustrationTrend)
              )}>
                {getTrendLabel(patient.frustrationTrend)}
              </span>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{patient.adherenceScore}%</p>
                <p className={way(TEXT.micro, 'text-slate-500')}>Adherencia</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{patient.avgSessionMinutes}m</p>
                <p className={way(TEXT.micro, 'text-slate-500')}>Media/sesión</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{patient.completionRate}%</p>
                <p className={way(TEXT.micro, 'text-slate-500')}>Completados</p>
              </div>
            </div>

            {/* Red flags */}
            {patient.redFlags.length > 0 && (
              <div className="space-y-1">
                {patient.redFlags.map((flag, i) => (
                  <p key={i} className={way(TEXT.micro, 'text-rose-600 flex items-center gap-1')}>
                    <span aria-hidden="true">⚠️</span> {flag}
                  </p>
                ))}
              </div>
            )}

            {/* Expanded view */}
            {selectedPatient === patient.patientId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 border-t border-slate-200 pt-3"
              >
                <p className={way(TEXT.label, 'mb-2')}>Recomendación terapéutica</p>
                <p className={way(TEXT.micro, 'text-slate-600')}>
                  {patient.frustrationTrend === 'worsening'
                    ? 'Considerar reducir dificultad del Nivel 3 o introducir pausas guiadas (Modo Zen).'
                    : 'Continuar con el plan actual. Reforzar con recompensas visuales.'}
                </p>
                <button
                  className={way(
                    BTN.secondary,
                    'mt-3 w-full text-sm'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticService.click();
                    // Abrir detalle completo
                  }}
                >
                  Ver sesiones detalladas
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
