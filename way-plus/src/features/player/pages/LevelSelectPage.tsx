import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Step } from '@/core/engine/types';

/* ─── colour tokens ──────────────────────────────────────────────── */
const C = {
  indigo:      '#4F46E5',
  indigoLight: '#E8E9FF',
  indigoDark:  '#3730A3',
  teal:        '#14B8A6',
  amber:       '#F59E0B',
  text:        '#1E1B4B',
  muted:       '#6B7280',
  border:      '#E8E9FF',
  bg:          '#F4F5FF',
  white:       '#ffffff',
};

/* ─── step metadata ──────────────────────────────────────────────── */
const STEP_META: Record<string, { icon: string; color: string; bg: string; desc: string }> = {
  'step-1-relaxation':     { icon: '🧘', color: '#14B8A6', bg: '#CCFBF1', desc: 'Regulación emocional' },
  'step-2-autonomy':       { icon: '⭐', color: C.indigo,  bg: C.indigoLight, desc: 'Independencia y autoestima' },
  'step-3-assertiveness':  { icon: '🤝', color: '#F59E0B', bg: '#FEF3C7', desc: 'Habilidades sociales' },
};

/* ─── helpers ────────────────────────────────────────────────────── */
const pct = (done: number, total: number) =>
  total === 0 ? 0 : Math.round((done / total) * 100);

/* ─── Step Card ──────────────────────────────────────────────────── */
function StepCard({ step, done, total, locked, onTap }: {
  step: Step; done: number; total: number; locked: boolean; onTap: () => void;
}) {
  const meta = STEP_META[step.id] ?? {
    icon: '📚', color: C.muted, bg: '#F3F4F6', desc: '',
  };
  const progress = pct(done, total);
  const complete = progress === 100;

  return (
    <motion.button
      whileHover={!locked ? { y: -2, boxShadow: '0 10px 30px rgba(79,70,229,.15)' } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
      onClick={!locked ? onTap : undefined}
      style={{
        width: '100%',
        background: locked ? '#F1F2FF' : C.white,
        border: complete
          ? `2.5px solid ${meta.color}`
          : `1.5px solid ${C.border}`,
        borderRadius: 20,
        padding: '18px 18px 14px',
        cursor: locked ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        opacity: locked ? 0.65 : 1,
        transition: 'box-shadow 0.2s',
        boxShadow: '0 2px 12px rgba(79,70,229,.06)',
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -18, right: -18,
        width: 70, height: 70, borderRadius: '50%',
        background: meta.bg, opacity: 0.8,
        pointerEvents: 'none',
      }} />

      {/* Icon + state badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: meta.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        <span style={{ fontSize: 18 }}>
          {locked ? '🔒' : complete ? '✅' : ''}
        </span>
      </div>

      {/* Title + desc */}
      <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 3 }}>
        {step.title}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
        {meta.desc}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#E8E9FF', borderRadius: 8, height: 8, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 8, background: meta.color }}
        />
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 600 }}>
        {done}/{total} WAYs · {progress}%
      </div>
    </motion.button>
  );
}

/* ─── Daily quest pill ───────────────────────────────────────────── */
function DailyQuest({ quest, onTap }: { quest: any; onTap: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: quest.completed
          ? '#ECFDF5'
          : 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
        border: `1.5px solid ${quest.completed ? '#6EE7B7' : '#FCD34D'}`,
        borderRadius: 18, padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: '#78350F', marginBottom: 4 }}>
        {quest.completed ? '✅ Misión completada' : '🌅 Misión del Día'}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>
        {quest.description}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,.6)', borderRadius: 12, padding: '4px 12px',
      }}>
        <span style={{ fontSize: 14 }}>🪙</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: C.amber }}>
          +{quest.reward?.coins ?? 15}
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export function LevelSelectPage() {
  const navigate = useNavigate();
  const completedWays = usePlayerStore(s => s.profile.completedWays) ?? [];
  const streakDays    = useRewardsStore(s => s.streakDays)   ?? 0;

  const [steps, setSteps]   = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registry.getStepsForLevel('pregamer')
      .then(s => setSteps(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* de-duplicate by id just in case registry returns duplicates */
  const uniqueSteps = steps.filter(
    (s, i, arr) => arr.findIndex(x => x.id === s.id) === i
  );

  const totalWays = uniqueSteps.reduce((n, s) => n + s.ways.length, 0);
  const totalDone = uniqueSteps.reduce(
    (n, s) => n + s.ways.filter(w => completedWays.includes(w.id)).length, 0
  );
  const totalPct = pct(totalDone, totalWays);

  const handleStep = (step: Step) => {
    const first = step.ways.find(w => !completedWays.includes(w.id));
    if (first) {
        navigate(`/play/pregamer/${step.id}/${first.id}`);
    } else {
        navigate(`/play/pregamer/${step.id}/${step.ways[0].id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-padding" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Welcome banner ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#E8E9FF,#C7D2FE)',
        borderRadius: 20, padding: '18px 18px 16px',
        border: `1.5px solid #C7D2FE`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>¡Hola! 👋</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.text }}>
              ¿Listo para jugar hoy?
            </div>
          </div>
          {streakDays > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#FFF7ED', border: '1.5px solid #FED7AA',
              borderRadius: 20, padding: '6px 12px',
            }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#C2410C' }}>{streakDays}</span>
            </div>
          )}
        </div>

        {/* Global progress */}
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>
          Progreso PREGAMER — {totalDone}/{totalWays} WAYs ({totalPct}%)
        </div>
        <div style={{ background: 'rgba(255,255,255,.5)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 8, background: C.indigo }}
          />
        </div>
      </div>

      {/* ── Steps ─────────────────────────────────────────────── */}
      <section>
        <div style={{
          fontWeight: 700, fontSize: 11, color: C.muted,
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12,
        }}>
          Módulos PREGAMER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {uniqueSteps.map((step, idx) => {
            const done = step.ways.filter(w => completedWays.includes(w.id)).length;
            const prev = uniqueSteps[idx - 1];
            const prevDone = prev
              ? prev.ways.filter(w => completedWays.includes(w.id)).length
              : Infinity;
            const locked = idx > 0 && prevDone < (prev?.ways.length ?? 0);

            return (
              <StepCard
                key={step.id}
                step={step}
                done={done}
                total={step.ways.length}
                locked={locked}
                onTap={() => handleStep(step)}
              />
            );
          })}
        </div>
      </section>

      {/* ── GAMER teaser ──────────────────────────────────────── */}
      <section>
        <div style={{
          fontWeight: 700, fontSize: 11, color: C.muted,
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12,
        }}>
          Próximamente
        </div>
        <div style={{
          background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
          borderRadius: 20, padding: '18px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            fontSize: 34, background: 'rgba(255,255,255,.1)',
            borderRadius: 14, padding: '10px 12px', flexShrink: 0,
          }}>🎮</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Nivel GAMER</div>
            <div style={{ fontSize: 12, color: '#A5B4FC', marginTop: 4 }}>
              Secuencias, memoria y trazado.
            </div>
          </div>
          <span style={{ fontSize: 18 }}>🔒</span>
        </div>
      </section>

    </div>
  );
}
