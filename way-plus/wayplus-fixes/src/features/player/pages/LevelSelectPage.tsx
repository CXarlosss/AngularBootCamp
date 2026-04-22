import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { useDailyQuests } from '@/features/rewards/hooks/useDailyQuests';
import { StreakFlame } from '@/features/rewards/components/StreakFlame';
import type { Step } from '@/core/engine/types';

/* ─── helpers ────────────────────────────────────────────────────────── */
const pct = (done: number, total: number) =>
  total === 0 ? 0 : Math.round((done / total) * 100);

const LEVEL_META: Record<string, {
  icon: string; label: string; subtitle: string;
  color: string; bg: string;
}> = {
  'step-1-relaxation':  { icon: '🧘', label: 'Relajación',  subtitle: 'Regulación emocional', color: '#14B8A6', bg: '#CCFBF1' },
  'step-2-autonomy':    { icon: '⭐', label: 'Autonomía',   subtitle: 'Independencia y autoestima', color: '#4F46E5', bg: '#E8E9FF' },
  'step-3-assertiveness':{ icon: '🤝', label: 'Asertividad', subtitle: 'Habilidades sociales', color: '#F59E0B', bg: '#FEF3C7' },
};

/* ─── Step card ──────────────────────────────────────────────────────── */
function StepCard({ step, done, total, locked, onTap }: {
  step: Step; done: number; total: number; locked: boolean; onTap: () => void;
}) {
  const meta = LEVEL_META[step.id] ?? {
    icon: '📚', label: step.title, subtitle: '', color: '#6B7280', bg: '#F3F4F6',
  };
  const progress = pct(done, total);
  const complete = progress === 100;

  return (
    <motion.button
      whileHover={!locked ? { y: -3, boxShadow: '0 12px 32px rgba(79,70,229,0.15)' } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
      onClick={!locked ? onTap : undefined}
      style={{
        width: '100%',
        background: locked ? '#F1F2FF' : '#fff',
        border: complete ? `2.5px solid ${meta.color}` : '1.5px solid #E8E9FF',
        borderRadius: 20,
        padding: '18px 18px 14px',
        cursor: locked ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        opacity: locked ? 0.6 : 1,
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -16, right: -16,
        width: 72, height: 72, borderRadius: '50%',
        background: meta.bg, opacity: 0.8,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {/* Icon pill */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: meta.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        {/* State badge */}
        <span style={{ fontSize: 20 }}>
          {locked ? '🔒' : complete ? '✅' : ''}
        </span>
      </div>

      <div style={{ fontWeight: 700, fontSize: 16, color: '#1E1B4B', marginBottom: 2 }}>
        {meta.label}
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
        {meta.subtitle}
      </div>

      {/* Progress */}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: meta.color }}
        />
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, fontWeight: 600 }}>
        {done}/{total} WAYs completados · {progress}%
      </div>
    </motion.button>
  );
}

/* ─── Daily quest card ───────────────────────────────────────────────── */
function DailyQuestCard({ quest, onTap }: { quest: any; onTap: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      style={{
        width: '100%', textAlign: 'left',
        background: quest.completed ? '#ECFDF5' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        border: `1.5px solid ${quest.completed ? '#6EE7B7' : '#FCD34D'}`,
        borderRadius: 18, padding: '16px 18px', cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: '#78350F', marginBottom: 4 }}>
        {quest.completed ? '✅ Misión completada' : '🌅 Misión del Día'}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>
        {quest.description}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,0.6)', borderRadius: 12,
        padding: '4px 12px',
      }}>
        <span style={{ fontSize: 15 }}>🪙</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#D97706' }}>
          +{quest.reward.coins}
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export function LevelSelectPage() {
  const navigate = useNavigate();
  const { completedWays } = usePlayerStore();
  const { streakDays } = useRewardsStore();
  const dailyQuests = useDailyQuests();

  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registry.getStepsForLevel('pregamer')
      .then(setSteps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Total progress across all steps
  const totalWays = steps.reduce((s, st) => s + st.ways.length, 0);
  const totalDone = steps.reduce(
    (s, st) => s + st.ways.filter(w => completedWays.includes(w.id)).length, 0
  );
  const totalPct = pct(totalDone, totalWays);

  const handleStepTap = (step: Step) => {
    const firstIncomplete = step.ways.find(w => !completedWays.includes(w.id));
    if (firstIncomplete) {
      navigate(`/play/pregamer/${step.id}/${firstIncomplete.id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-padding" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E8E9FF, #C7D2FE)',
        borderRadius: 20, padding: '18px 18px 16px',
        border: '1.5px solid #C7D2FE',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>¡Hola! 👋</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#1E1B4B' }}>
              ¿Listo para jugar hoy?
            </div>
          </div>
          {streakDays > 0 && <StreakFlame />}
        </div>

        {/* Global progress */}
        <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>
          Progreso PREGAMER — {totalDone}/{totalWays} WAYs ({totalPct}%)
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${totalPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Steps */}
      <section>
        <div style={{
          fontWeight: 700, fontSize: 12, color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12,
        }}>
          Módulos PREGAMER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((step, idx) => {
            const stepDone = step.ways.filter(w => completedWays.includes(w.id)).length;
            const prevStep = steps[idx - 1];
            const prevDone = prevStep
              ? prevStep.ways.filter(w => completedWays.includes(w.id)).length
              : prevStep?.ways.length ?? 999;
            const locked = idx > 0 && prevDone < (prevStep?.ways.length ?? 0);

            return (
              <StepCard
                key={step.id}
                step={step}
                done={stepDone}
                total={step.ways.length}
                locked={locked}
                onTap={() => handleStepTap(step)}
              />
            );
          })}
        </div>
      </section>

      {/* Daily quests */}
      {dailyQuests.length > 0 && (
        <section>
          <div style={{
            fontWeight: 700, fontSize: 12, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12,
          }}>
            Misiones de hoy
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dailyQuests.slice(0, 1).map(q => (
              <DailyQuestCard
                key={q.id}
                quest={q}
                onTap={() => navigate(`/play/pregamer/${q.wayId.split('-')[0]}-step/${q.wayId}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* GAMER level teaser */}
      <section>
        <div style={{
          fontWeight: 700, fontSize: 12, color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12,
        }}>
          Próximamente
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
          borderRadius: 20, padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
          opacity: 0.85,
        }}>
          <div style={{
            fontSize: 36, background: 'rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '10px 12px', flexShrink: 0,
          }}>🎮</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Nivel GAMER</div>
            <div style={{ fontSize: 12, color: '#A5B4FC', marginTop: 4 }}>
              Secuencias, memoria y trazado. Completa PREGAMER para desbloquear.
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 20 }}>🔒</span>
        </div>
      </section>

    </div>
  );
}
