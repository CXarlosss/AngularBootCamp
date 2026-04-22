import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Way } from '@/core/engine/types';

/* ─── Back button ────────────────────────────────────────────────────── */
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#fff', border: '1.5px solid #E8E9FF',
        borderRadius: 12, padding: '8px 14px',
        fontWeight: 700, fontSize: 14, color: '#4F46E5',
        cursor: 'pointer', flexShrink: 0,
        minHeight: 44,
      }}
    >
      ← Volver
    </motion.button>
  );
}

/* ─── Top progress strip ─────────────────────────────────────────────── */
function WayProgress({ current, total, stepLabel }: {
  current: number; total: number; stepLabel: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4,
      }}>
        <span>{stepLabel}</span>
        <span>{current}/{total}</span>
      </div>
      <div className="progress-track" style={{ height: 7 }}>
        <div
          className="progress-fill"
          style={{ width: `${(current / total) * 100}%`, transition: 'width 0.5s ease' }}
        />
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export function WayPlayerPage() {
  const { levelId, stepId, wayId } = useParams<{
    levelId: string; stepId: string; wayId: string;
  }>();
  const navigate = useNavigate();

  const { completeWay, completedWays } = usePlayerStore();
  const { celebrateCompletion, addCoins, checkAndUpdateStreak } = useRewardsStore();

  const [celebration, setCelebration] = useState<{
    show: boolean; type: 'happy' | 'sad' | 'step-complete'; coins: number;
  }>({ show: false, type: 'happy', coins: 0 });

  // Load step from registry
  const step = useMemo(() => {
    if (!stepId) return null;
    return registry.getStepById(stepId);
  }, [stepId]);

  const ways: Way[] = step?.ways ?? [];
  const currentIdx = ways.findIndex(w => w.id === wayId);
  const currentWay = ways[currentIdx] ?? null;
  const isLastWay = currentIdx === ways.length - 1;

  const handleCorrect = useCallback(() => {
    if (!currentWay) return;
    completeWay(currentWay.id, 1);
    addCoins(10, 'way-correct');
    checkAndUpdateStreak();

    if (isLastWay) {
      // Complete the whole step
      celebrateCompletion('step');
      setCelebration({ show: true, type: 'step-complete', coins: 110 });
    } else {
      celebrateCompletion('way');
      setCelebration({ show: true, type: 'happy', coins: 10 });
    }
  }, [currentWay, isLastWay, completeWay, addCoins, checkAndUpdateStreak, celebrateCompletion]);

  const handleIncorrect = useCallback(() => {
    setCelebration({ show: true, type: 'sad', coins: 0 });
  }, []);

  const handleCelebrationDone = () => {
    setCelebration(c => ({ ...c, show: false }));
    if (celebration.type === 'step-complete') {
      navigate(`/`);
    } else if (celebration.type === 'happy' && !isLastWay) {
      // Navigate to next way
      const nextWay = ways[currentIdx + 1];
      navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
    }
    // If 'sad', stay on same way (WayRenderer will allow retry)
  };

  if (!step || !currentWay) {
    return (
      <div className="page-padding" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontWeight: 700, color: '#1E1B4B', marginBottom: 12 }}>
          Reto no encontrado
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#4F46E5', color: '#fff', border: 'none',
            borderRadius: 12, padding: '12px 24px',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Top bar: back + progress ────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(244,245,255,0.95)',
        backdropFilter: 'blur(8px)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid #E8E9FF',
      }}>
        <BackButton onPress={() => navigate('/')} />
        <WayProgress
          current={currentIdx + 1}
          total={ways.length}
          stepLabel={step.title}
        />
      </div>

      {/* ── Way content ────────────────────────────────────────────── */}
      <div className="page-padding">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWay.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <WayRenderer
              way={currentWay}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Celebration overlay ─────────────────────────────────────── */}
      <CelebrationOverlay
        show={celebration.show}
        type={celebration.type}
        coins={celebration.coins}
        onComplete={handleCelebrationDone}
      />
    </>
  );
}
