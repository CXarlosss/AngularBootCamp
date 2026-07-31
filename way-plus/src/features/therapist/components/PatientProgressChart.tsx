/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ PatientProgressChart — Evolución semanal/mensual
 * Recharts o SVG nativo. Uso SVG para zero dependencias extra.
 * ═══════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { useReduceMotion } from '@/core/stores/configStore';

interface DataPoint {
  date: string; // ISO date
  score: number; // 0-100
  sessions: number;
  avgFrustration: number; // 0-10
}

interface PatientProgressChartProps {
  data: DataPoint[];
  title?: string;
  period?: 'week' | 'month';
}

export const PatientProgressChart: React.FC<PatientProgressChartProps> = ({
  data,
  title = 'Evolución del progreso',
  period = 'week',
}) => {
  const reduceMotion = useReduceMotion();

  const { maxScore, pathD, areaD, points, labels } = useMemo(() => {
    if (data.length === 0) return { maxScore: 100, pathD: '', areaD: '', points: [], labels: [] };

    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const max = Math.max(100, ...data.map((d) => d.score));
    const xStep = chartW / (data.length - 1 || 1);

    const pts = data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + chartH - (d.score / max) * chartH,
      score: d.score,
      date: d.date,
      sessions: d.sessions,
    }));

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Área bajo la curva
    const area = `${path} L ${pts[pts.length - 1].x} ${padding.top + chartH} L ${pts[0].x} ${padding.top + chartH} Z`;

    const lbls = data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + chartH + 20,
      label: new Date(d.date).toLocaleDateString('es', { day: 'numeric', month: 'short' }),
    }));

    return { maxScore: max, pathD: path, areaD: area, points: pts, labels: lbls };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={way(GLASS.card, 'rounded-2xl p-6 text-center')}>
        <p className={TEXT.subtitle}>Sin datos suficientes</p>
        <p className={way(TEXT.micro, 'mt-1')}>El paciente necesita al menos 2 sesiones para mostrar evolución.</p>
      </div>
    );
  }

  return (
    <div className={way(GLASS.card, 'rounded-2xl p-5')}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={TEXT.subtitle}>{title}</h3>
        <span className={way(TEXT.micro, 'rounded-full bg-indigo-100 px-2.5 py-0.5 text-indigo-700')}>
          {period === 'week' ? 'Últimos 7 días' : 'Último mes'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 220" className="w-full min-w-[500px]" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={40}
                y1={180 - (tick / 100) * 160}
                x2={580}
                y2={180 - (tick / 100) * 160}
                stroke="rgba(148,163,184,0.2)"
                strokeDasharray="4,4"
              />
              <text
                x={35}
                y={185 - (tick / 100) * 160}
                textAnchor="end"
                className="text-xs fill-slate-400"
                style={{ fontSize: '10px' }}
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Area */}
          <motion.path
            d={areaD}
            fill="rgba(99,102,241,0.1)"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#4F46E5"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? {} : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.g
              key={i}
              initial={reduceMotion ? {} : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#4F46E5" strokeWidth={2} />
              <title>{`${p.date}: ${p.score}% (${p.sessions} sesiones)`}</title>
            </motion.g>
          ))}

          {/* X labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              className="text-xs fill-slate-500"
              style={{ fontSize: '10px' }}
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Puntuación
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Sombra de progreso
        </div>
      </div>
    </div>
  );
};
