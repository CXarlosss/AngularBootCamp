/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ ParentDashboard — Panel familiar
 * Resumen semanal, consejos, logros y notas del terapeuta
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { rw, CONTAINER, SAFE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';
import { useParentData } from '@/shared/hooks/useParentData';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const MOOD_CONFIG = {
  happy: { label: 'Contenta', color: 'text-emerald-600 bg-emerald-100 border-emerald-200', emoji: '😊' },
  neutral: { label: 'Tranquila', color: 'text-indigo-600 bg-indigo-100 border-indigo-200', emoji: '😐' },
  frustrated: { label: 'Frustrada', color: 'text-amber-600 bg-amber-100 border-amber-200', emoji: '😤' },
};

const TIP_ICONS: Record<string, string> = {
  communication: '💬',
  routine: '⏰',
  encouragement: '⭐',
  rest: '🌙',
};

export const ParentDashboard: React.FC<{ childId: string }> = ({ childId }) => {
  const { data, isLoading } = useParentData(childId);
  const reduceMotion = useReduceMotion();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner size="lg" message="Cargando resumen familiar..." />
      </div>
    );
  }

  const { child, thisWeek, lastWeek, tips, recentAchievements, therapistNote } = data;
  const mood = MOOD_CONFIG[thisWeek.moodTrend];
  const weekOverWeekSessions = thisWeek.sessionsCount - lastWeek.sessionsCount;
  const weekOverWeekMinutes = thisWeek.totalMinutes - lastWeek.totalMinutes;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-50 to-amber-50/20">
      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className={way(CONTAINER.containerMobile, 'py-4')}>
          <h1 className={TEXT.title}>Panel Familiar</h1>
          <p className={TEXT.micro}>Resumen semanal de {child.name}</p>
        </div>
      </header>

      <main className={way(CONTAINER.containerMobile, SAFE.safeBottom, 'space-y-5 pb-8 pt-4')}>
        {/* Hero: Niño + personaje */}
        <motion.section
          className={way(GLASS.card, 'relative overflow-hidden rounded-3xl p-5')}
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-4xl">
              {child.avatar}
            </div>
            <div className="flex-1">
              <h2 className={TEXT.title}>{child.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200">
                  {child.characterEmoji} {child.characterName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  ⭐ Nivel {child.currentLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className={way(GLASS.cardSolid, 'rounded-2xl p-3 text-center')}>
              <p className="text-2xl font-bold text-amber-600">{child.totalStars}</p>
              <p className={way(TEXT.micro, 'mt-0.5')}>Estrellas</p>
            </div>
            <div className={way(GLASS.cardSolid, 'rounded-2xl p-3 text-center')}>
              <p className="text-2xl font-bold text-yellow-600">{child.totalCoins}</p>
              <p className={way(TEXT.micro, 'mt-0.5')}>Monedas</p>
            </div>
            <div className={way(GLASS.cardSolid, 'rounded-2xl p-3 text-center')}>
              <p className="text-2xl font-bold text-indigo-600">{thisWeek.streakDays}</p>
              <p className={way(TEXT.micro, 'mt-0.5')}>Racha</p>
            </div>
          </div>
        </motion.section>

        {/* Weekly chart */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-4')}
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className={TEXT.subtitle}>Actividad esta semana</h3>
            <span className={way('rounded-full px-2.5 py-0.5 text-xs font-bold border', mood.color)}>
              {mood.emoji} {mood.label}
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-32">
            {child.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  className={way(
                    'w-full rounded-t-lg',
                    value >= 80 && 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]',
                    value >= 50 && value < 80 && 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
                    value < 50 && 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  )}
                  initial={reduceMotion ? {} : { height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                />
                <span className="text-xs font-semibold text-slate-500">{WEEK_DAYS[index]}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Weekly stats comparison */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-4')}
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Comparativa semanal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{thisWeek.sessionsCount}</p>
              <p className={way(TEXT.micro, 'text-slate-500')}>Sesiones</p>
              <p className={way('mt-1 text-xs font-bold', weekOverWeekSessions >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {weekOverWeekSessions >= 0 ? '+' : ''}{weekOverWeekSessions} vs semana pasada
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{thisWeek.totalMinutes}</p>
              <p className={way(TEXT.micro, 'text-slate-500')}>Minutos jugados</p>
              <p className={way('mt-1 text-xs font-bold', weekOverWeekMinutes >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {weekOverWeekMinutes >= 0 ? '+' : ''}{weekOverWeekMinutes} min
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{thisWeek.levelsCompleted}</p>
              <p className={way(TEXT.micro, 'text-slate-500')}>Niveles completados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{thisWeek.averageScore}%</p>
              <p className={way(TEXT.micro, 'text-slate-500')}>Puntuación media</p>
            </div>
          </div>
        </motion.section>

        {/* Therapist note */}
        {therapistNote && (
          <motion.section
            className={way(GLASS.card, 'rounded-2xl p-4 border-l-4 border-indigo-400')}
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                👩⚕️
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Nota de la terapeuta</p>
                <p className={way('mt-1 text-sm text-slate-600 leading-relaxed')}>{therapistNote}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Tips */}
        <motion.section
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Consejos para esta semana</h3>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.id}
                className={way(GLASS.card, 'rounded-2xl p-4')}
                initial={reduceMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    {TIP_ICONS[tip.category]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{tip.title}</p>
                    <p className={way('mt-1 text-sm text-slate-600 leading-relaxed')}>{tip.body}</p>
                    {tip.actionLabel && (
                      <button
                        className={way(
                          'mt-2 text-sm font-semibold text-indigo-600 underline underline-offset-2',
                          'focus-visible:ring-2 focus-visible:ring-indigo-500/50'
                        )}
                        onClick={() => hapticService.click()}
                      >
                        {tip.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent achievements */}
        <motion.section
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-3')}>Logros recientes</h3>
          <div className="space-y-2">
            {recentAchievements.map((ach, index) => (
              <motion.div
                key={index}
                className={way(GLASS.card, 'flex items-center gap-3 rounded-xl px-4 py-3')}
                initial={reduceMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <span className="text-2xl" aria-hidden="true">{ach.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{ach.title}</p>
                  <p className={way(TEXT.micro, 'text-slate-500')}>{ach.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Next milestone */}
        <motion.section
          className={way(GLASS.card, 'rounded-2xl p-4 text-center')}
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className={way(TEXT.micro, 'text-slate-500 mb-1')}>Próximo objetivo</p>
          <p className="text-lg font-bold text-indigo-600">{child.nextMilestone}</p>
          <p className={way(TEXT.micro, 'mt-2 text-slate-500')}>
            {child.name} está a 2 niveles de desbloquearlo
          </p>
        </motion.section>

        {/* Share with therapist */}
        <div className="pt-2 pb-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => hapticService.click()}
          >
            💬 Enviar comentario a la terapeuta
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
