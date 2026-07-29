/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Refactor — FamilyDashboardPage.tsx
 * Panel familiar / progreso del niño
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GLASS,
  BTN,
  TEXT,
  STATUS,
  DECORATIVE,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { rw, RESPONSIVE, CONTAINER, SAFE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';

// ─── TYPES ───
export interface ActivityLog {
  id: string;
  title: string;
  date: string;
  score: number;
  duration: string;
  type: 'way' | 'zen' | 'mission';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface ChildProfile {
  name: string;
  avatar: string;
  level: number;
  totalStars: number;
  totalCoins: number;
  streakDays: number;
  weeklyProgress: number[];
}

// ─── MOCK DATA ───
const MOCK_PROFILE: ChildProfile = {
  name: 'Lucía',
  avatar: '👧',
  level: 5,
  totalStars: 47,
  totalCoins: 320,
  streakDays: 12,
  weeklyProgress: [80, 65, 90, 100, 75, 85, 60],
};

const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'a1', title: 'El Bosque Encantado', date: 'Hoy, 10:30', score: 85, duration: '15 min', type: 'way' },
  { id: 'a2', title: 'Modo Zen', date: 'Ayer, 18:00', score: 100, duration: '10 min', type: 'zen' },
  { id: 'a3', title: 'Misión: Completa 3 niveles', date: 'Ayer, 14:00', score: 100, duration: '25 min', type: 'mission' },
  { id: 'a4', title: 'El Puente Mágico', date: 'Hace 2 días', score: 70, duration: '12 min', type: 'way' },
  { id: 'a5', title: 'Cofre Diario', date: 'Hace 2 días', score: 100, duration: '5 min', type: 'mission' },
];

const MOCK_MILESTONES: Milestone[] = [
  { id: 'm1', title: 'Primera semana', description: '7 días seguidos de juego', date: 'Hace 2 semanas', icon: '🔥' },
  { id: 'm2', title: 'Nivel 5', description: 'Alcanzado el nivel 5', date: 'Hace 1 semana', icon: '⭐' },
  { id: 'm3', title: '50 estrellas', description: 'Reunió 50 estrellas', date: 'Hace 3 días', icon: '🏆' },
];

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// ─── COMPONENT ───
export const FamilyDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'progress' | 'activities' | 'milestones'>('progress');

  const tabs: Array<{ key: typeof activeTab; label: string }> = [
    { key: 'progress', label: 'Progreso' },
    { key: 'activities', label: 'Actividades' },
    { key: 'milestones', label: 'Logros' },
  ];

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'way': return '🎮';
      case 'zen': return '🧘';
      case 'mission': return '🎯';
    }
  };

  const getActivityColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'way': return 'bg-indigo-100 text-indigo-700';
      case 'zen': return 'bg-emerald-100 text-emerald-700';
      case 'mission': return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-50 to-amber-50/20">
      <div className={DECORATIVE.orb('amber', 'top-right')} aria-hidden="true" />
      <div className={DECORATIVE.orb('indigo', 'bottom-left')} aria-hidden="true" />

      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className={way(CONTAINER.containerMobile, 'py-4')}>
          <h1 className={TEXT.title}>Panel Familiar</h1>
          <p className={TEXT.micro}>Seguimiento del progreso de {MOCK_PROFILE.name}</p>
        </div>
      </header>

      <main className={way(CONTAINER.containerMobile, SAFE.safeBottom, 'pb-8 pt-4')}>
        {/* Profile hero */}
        <motion.section
          className={way(GLASS.card, 'relative mb-6 overflow-hidden rounded-3xl p-5 sm:p-6')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={DECORATIVE.orb('amber', 'top-right')} aria-hidden="true" />

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-4xl sm:h-20 sm:w-20">
              {MOCK_PROFILE.avatar}
            </div>
            <div className="flex-1">
              <h2 className={TEXT.title}>{MOCK_PROFILE.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  <StarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Nivel {MOCK_PROFILE.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                  <FireIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Racha: {MOCK_PROFILE.streakDays} días
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={way(GLASS.cardSolid, 'rounded-2xl p-3 text-center')}>
              <p className="text-2xl font-bold text-amber-600">{MOCK_PROFILE.totalStars}</p>
              <p className={way(TEXT.micro, 'mt-0.5')}>Estrellas</p>
            </div>
            <div className={way(GLASS.cardSolid, 'rounded-2xl p-3 text-center')}>
              <p className="text-2xl font-bold text-yellow-600">{MOCK_PROFILE.totalCoins}</p>
              <p className={way(TEXT.micro, 'mt-0.5')}>Monedas</p>
            </div>
          </div>
        </motion.section>

        {/* Weekly progress chart */}
        <motion.section
          className={way(GLASS.card, 'mb-6 rounded-2xl p-4 sm:p-5')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className={way(TEXT.subtitle, 'mb-4')}>Progreso semanal</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {MOCK_PROFILE.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  className={way(
                    'w-full rounded-t-lg',
                    value >= 80 && 'bg-emerald-400',
                    value >= 50 && value < 80 && 'bg-indigo-400',
                    value < 50 && 'bg-amber-400'
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                />
                <span className="text-xs font-semibold text-slate-500">{WEEK_DAYS[index]}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                hapticService.click();
                setActiveTab(tab.key);
              }}
              className={way(
                'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg'
                  : 'bg-white/60 text-slate-600 hover:bg-white',
                'min-h-[44px]',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
                'forced-colors:border-2 forced-colors:border-[#1E1B4B]'
              )}
              aria-pressed={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className={way(GLASS.card, 'rounded-2xl p-4')}>
                <div className="flex items-center justify-between mb-3">
                  <span className={TEXT.subtitle}>Nivel actual</span>
                  <span className="text-2xl font-bold text-indigo-600">{MOCK_PROFILE.level}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/60">
                  <motion.div
                    className="h-full rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className={way(TEXT.micro, 'mt-2')}>72% para llegar al nivel 6</p>
              </div>

              <div className={way(GLASS.card, 'rounded-2xl p-4')}>
                <div className="flex items-center justify-between mb-3">
                  <span className={TEXT.subtitle}>Racha de días</span>
                  <span className="text-2xl font-bold text-amber-600">{MOCK_PROFILE.streakDays}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className={way(
                        'h-8 flex-1 rounded-lg',
                        i < MOCK_PROFILE.streakDays
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                          : 'bg-slate-200/60'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className={way(TEXT.micro, 'mt-2')}>
                  {MOCK_PROFILE.streakDays} días seguidos jugando
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {MOCK_ACTIVITIES.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className={way(GLASS.card, 'rounded-2xl p-4')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={way('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg', getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                      <p className={TEXT.micro}>{activity.date} • {activity.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className={way(
                        'text-sm font-bold',
                        activity.score >= 80 && 'text-emerald-600',
                        activity.score >= 50 && activity.score < 80 && 'text-indigo-600',
                        activity.score < 50 && 'text-amber-600'
                      )}>
                        {activity.score}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {MOCK_MILESTONES.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  className={way(
                    GLASS.card,
                    'relative overflow-hidden rounded-2xl p-4',
                    'border-l-4 border-amber-400'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                      {milestone.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{milestone.title}</p>
                      <p className={TEXT.micro}>{milestone.description}</p>
                      <p className={way(TEXT.micro, 'mt-1 text-slate-400')}>{milestone.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ─── ICONOS INLINE ───
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
    <path d="M12 7c-2 3-3 5-3 7a3 3 0 0 0 6 0c0-2-1-4-3-7z" />
  </svg>
);

export default FamilyDashboardPage;
