/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ TherapistReportView — Pantalla completa de informe
 * Integra gráfico, métricas, tabla de sesiones y exportación PDF
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { GLASS, BTN, TEXT, STATUS, way } from '@/shared/lib/wayTheme';
import { rw, CONTAINER, SAFE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { PatientProgressChart } from './PatientProgressChart';
import { useTherapistReport } from '@/shared/hooks/useTherapistReport';

interface TherapistReportViewProps {
  patientId: string;
  onBack?: () => void;
}

export const TherapistReportView: React.FC<TherapistReportViewProps> = ({ patientId, onBack }) => {
  const { reportData, generatePDF, isGenerating } = useTherapistReport(patientId);

  const trendConfig = {
    improving: { label: 'Mejorando', color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
    stable: { label: 'Estable', color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
    worsening: { label: 'Requiere atención', color: 'text-rose-600 bg-rose-100 border-rose-200' },
  };

  const trend = trendConfig[reportData.evolution.frustrationTrend];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/20">
      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className={way(CONTAINER.containerMobile, 'py-4')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="icon" aria-label="Volver" onClick={onBack}>
                  ←
                </Button>
              )}
              <div>
                <h1 className={TEXT.title}>Informe terapéutico</h1>
                <p className={TEXT.micro}>{reportData.patientName} • {reportData.reportPeriod}</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                hapticService.click();
                generatePDF();
              }}
              disabled={isGenerating}
              aria-busy={isGenerating}
            >
              {isGenerating ? 'Generando...' : '📄 Exportar PDF'}
            </Button>
          </div>
        </div>
      </header>

      <main className={way(CONTAINER.containerMobile, SAFE.safeBottom, 'space-y-5 pb-8 pt-4')}>
        {/* Summary cards */}
        <section className={way(rw('gridShop'), 'gap-3')}>
          {[
            { label: 'Sesiones', value: reportData.summary.totalSessions, unit: '' },
            { label: 'Tiempo total', value: reportData.summary.totalPlayTimeHours, unit: 'h' },
            { label: 'Media/sesión', value: reportData.summary.avgSessionMinutes, unit: 'min' },
            { label: 'Adherencia', value: reportData.summary.adherenceScore, unit: '%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className={way(GLASS.card, 'rounded-2xl p-4 text-center')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="text-2xl font-bold text-slate-900">
                {stat.value}
                <span className="text-sm font-medium text-slate-500 ml-0.5">{stat.unit}</span>
              </p>
              <p className={way(TEXT.micro, 'mt-1')}>{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {/* Trend badge */}
        <div className="flex items-center gap-3">
          <span className={way('rounded-full px-3 py-1 text-xs font-bold border', trend.color)}>
            {trend.label}
          </span>
          <span className={way(TEXT.micro, 'text-slate-500')}>
            {reportData.evolution.weekOverWeekChange > 0 ? '+' : ''}
            {reportData.evolution.weekOverWeekChange}% vs semana anterior
          </span>
        </div>

        {/* Chart */}
        <PatientProgressChart
          data={[
            { date: '2026-07-25', score: 45, sessions: 2, avgFrustration: 6 },
            { date: '2026-07-26', score: 52, sessions: 3, avgFrustration: 5 },
            { date: '2026-07-27', score: 58, sessions: 2, avgFrustration: 4 },
            { date: '2026-07-28', score: 65, sessions: 3, avgFrustration: 3 },
            { date: '2026-07-29', score: 72, sessions: 2, avgFrustration: 2 },
            { date: '2026-07-30', score: 78, sessions: 3, avgFrustration: 2 },
            { date: '2026-07-31', score: 85, sessions: 2, avgFrustration: 1 },
          ]}
          title="Evolución semanal"
          period="week"
        />

        {/* Recommendations */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-5')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Recomendaciones terapéuticas</h3>
          <ul className="space-y-2">
            {reportData.evolution.recommendedNextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Milestones */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-5')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Logros del período</h3>
          <div className="space-y-3">
            {reportData.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 border-l-4 border-amber-400 pl-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">
                  ⭐
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{m.title}</p>
                  <p className={way(TEXT.micro, 'text-slate-500')}>
                    {new Date(m.date).toLocaleDateString('es')} — {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Session log */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-5')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Registro de sesiones</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Duración</th>
                  <th className="pb-2 font-medium">Niveles</th>
                  <th className="pb-2 font-medium">Puntuación</th>
                  <th className="pb-2 font-medium">Frustración</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {reportData.sessions.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2">{new Date(s.date).toLocaleDateString('es')}</td>
                    <td className="py-2">{s.durationMinutes} min</td>
                    <td className="py-2">
                      {s.levelsCompleted}/{s.levelsAttempted}
                    </td>
                    <td className="py-2 font-semibold text-indigo-600">{s.avgScore}%</td>
                    <td className="py-2">
                      <span
                        className={way(
                          'rounded-full px-2 py-0.5 text-xs font-bold',
                          s.frustrationEvents === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : s.frustrationEvents <= 2
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                        )}
                      >
                        {s.frustrationEvents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default TherapistReportView;
