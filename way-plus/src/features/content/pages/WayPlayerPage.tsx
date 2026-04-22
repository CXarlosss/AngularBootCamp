import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Step, Way } from '@/core/engine/types';

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

  const completeWay = usePlayerStore(state => state.completeWay);
  const completedWays = usePlayerStore(state => state.profile.completedWays);
  const { celebrateCompletion, addCoins, checkAndUpdateStreak } = useRewardsStore();

  const [celebration, setCelebration] = useState<{
    show: boolean; type: 'happy' | 'sad' | 'step-complete' | 'annex-complete'; coins: number;
  }>({ show: false, type: 'happy', coins: 0 });

  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);

  // Load step from registry
  useEffect(() => {
    if (!stepId) return;
    registry.getStepByIdAsync(stepId)
      .then(setStep)
      .finally(() => setLoading(false));
  }, [stepId]);

  const ways: Way[] = step?.ways ?? [];
  const currentIdx = ways.findIndex(w => w.id === wayId);
  const currentWay = ways[currentIdx] ?? null;
  const isLastWay = currentIdx === ways.length - 1;

  const handleWayComplete = useCallback(() => {
    if (!currentWay) return;
    
    // Marcar el Way como completado
    completeWay(currentWay.id, 1);
    
    if (isLastWay) {
      // Complete the whole step
      celebrateCompletion('step');
      setCelebration({ show: true, type: 'step-complete', coins: 100 });
    } else {
      // Award points for single way
      celebrateCompletion('way');
      // Navigate to next way
      const nextWay = ways[currentIdx + 1];
      navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
    }
  }, [currentWay, isLastWay, ways, currentIdx, levelId, stepId, navigate, completeWay, celebrateCompletion]);

  const handleCelebrationDone = () => {
    setCelebration(c => ({ ...c, show: false }));
    if (celebration.type === 'step-complete') {
      navigate(`/play/${levelId}/${stepId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

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
        <BackButton onPress={() => navigate(`/play/${levelId}/${stepId}`)} />
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
              onComplete={handleWayComplete}
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
