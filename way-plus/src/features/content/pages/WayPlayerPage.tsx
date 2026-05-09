import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { MilestoneOverlay } from '@/features/player/components/MilestoneOverlay';
import { registry } from '@/content/registry';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { audioService } from '@/core/utils/audioService';
import { useConfigStore } from '@/core/stores/configStore';
import { BoostSelector } from '@/features/rewards/components/BoostSelector';
import { HomeworkCelebration } from '@/features/player/components/HomeworkCelebration';
import { homeworkService } from '@/core/services/homeworkService';
import { syncService } from '@/core/services/syncService';
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
      <div className="progress-track" style={{ height: 10, borderRadius: 20 }}>
        <div
          className="progress-fill"
          style={{ width: `${(current / total) * 100}%`, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
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
  const { reduceMotion } = useConfigStore((s) => s.accessibility);
  const { disableFilters } = useConfigStore((s) => s.performance);

  const completeWay = usePlayerStore(state => state.completeWay);
  const completedWays = usePlayerStore(state => state.profile?.completedWays || []);
  const { celebrateCompletion, addCoins, checkAndUpdateStreak } = useRewardsStore();
  const { dailyChallenge, completeDailyChallenge, profile } = usePlayerStore();

  const [celebration, setCelebration] = useState<{
    show: boolean; type: 'happy' | 'sad' | 'step-complete' | 'annex-complete'; coins: number;
  }>({ show: false, type: 'happy', coins: 0 });

  const [showMilestone, setShowMilestone] = useState(false);

  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoostSelector, setShowBoostSelector] = useState(true);
  const [selectedBoostId, setSelectedBoostId] = useState<string | null>(null);
  const { ownedBoosts, consumeBoost } = useRewardsStore();

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

  // Predictive prefetching for the next way
  useEffect(() => {
    const nextIdx = currentIdx + 1;
    const nextWay = ways[nextIdx];
    if (nextWay) {
      const urls = [
        nextWay.stimulus?.image,
        ...(nextWay.options?.map(o => o.image) || [])
      ].filter((u): u is string => typeof u === 'string');
      
      import('@/core/utils/preloadService').then(({ preloadImages }) => {
        preloadImages(urls).catch(() => console.warn('Preload failed for way:', nextWay.id));
      });
    }
  }, [currentIdx, ways]);

  // Lectura automática al entrar
  useEffect(() => {
    if (currentWay && !celebration.show) {
      // Pequeño delay para que no choque con la transición
      const timer = setTimeout(() => {
        audioService.speak(currentWay.title ?? currentWay.name ?? '');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWay, celebration.show]);


  const [showHomeworkCelebration, setShowHomeworkCelebration] = useState(false);
  const [isHomework, setIsHomework] = useState(false);
  const wayStartTime = useRef<number>(Date.now());

  // Reset clock on new way
  useEffect(() => {
    wayStartTime.current = Date.now();
  }, [wayId]);

  // Check if this is homework
  useEffect(() => {
    const patientId = sessionStorage.getItem('way-active-patient');
    if (patientId && wayId) {
      homeworkService.isHomework(patientId, wayId).then(setIsHomework);
    }
  }, [wayId]);

  const handleWayComplete = useCallback((_summary?: any) => {
    if (!currentWay) return;
    
    // 1. Marcar como completado
    completeWay(currentWay.id, 1);
    
    // 2. Calcular recompensas
    const isDaily = currentWay.id === dailyChallenge.wayId && !dailyChallenge.completed;
    const bonus = isDaily ? 30 : 0;
    
    if (isDaily) {
      completeDailyChallenge();
      addCoins(bonus, 'daily_challenge');
    }

    // 3. Decidir tipo de celebración
    if (isHomework) {
      setShowHomeworkCelebration(true);
      
      // Log con flag de refuerzo terapéutico
      syncService.logActivity({
        patientId: sessionStorage.getItem('way-active-patient') || '',
        wayId: currentWay.id,
        action: 'way_completed',
        attempts: 1,
        metadata: { 
          isHomework: true, 
          bonus,
          timeSpentMs: Date.now() - (wayStartTime.current || 0)
        }
      });

      // La navegación ocurrirá después de la celebración (3.5s)
      const nextWay = ways[currentIdx + 1];
      setTimeout(() => {
        if (isLastWay) {
          celebrateCompletion('step');
          setShowMilestone(true);
        } else if (nextWay) {
          navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
        } else {
          navigate(`/play/${levelId}/${stepId}`);
        }
      }, 3500);
    } else if (isLastWay) {
      // HITO: Módulo completo
      celebrateCompletion('step');
      setShowMilestone(true);
    } else {
      // ÉXITO: Way individual estándar
      celebrateCompletion('way');
      
      // Log estándar
      syncService.logActivity({
        patientId: sessionStorage.getItem('way-active-patient') || '',
        wayId: currentWay.id,
        action: 'way_completed',
        attempts: 1,
        metadata: { 
          isHomework: false, 
          bonus,
          timeSpentMs: Date.now() - (wayStartTime.current || 0)
        }
      });

      setCelebration({ 
        show: true, 
        type: 'happy', 
        coins: 10 + bonus 
      });

      // 4. Navegar al siguiente
      const nextWay = ways[currentIdx + 1];
      if (nextWay) {
        setTimeout(() => {
          navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
        }, 3000); 
      }
    }
  }, [currentWay, isLastWay, ways, currentIdx, levelId, stepId, navigate, completeWay, celebrateCompletion, dailyChallenge, completeDailyChallenge, addCoins, isHomework]);

  const handleCelebrationDone = () => {
    setCelebration(c => ({ ...c, show: false }));
    if (celebration.type === 'step-complete') {
      navigate(`/play/${levelId}/${stepId}`);
    }
  };

  const handleStartWithBoost = () => {
    if (selectedBoostId) {
      consumeBoost(selectedBoostId);
    }
    setShowBoostSelector(false);
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
        background: disableFilters ? '#F4F5FF' : 'rgba(244,245,255,0.95)',
        backdropFilter: disableFilters ? 'none' : 'blur(8px)',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {loading ? (
            <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <>
              <h1 style={{
                fontSize: 24, fontWeight: 900, color: '#1E1B4B',
                textAlign: 'center', margin: 0,
              }}>
                {currentWay?.title ?? currentWay?.name ?? 'Reto'}
              </h1>
              <motion.button
                whileTap={reduceMotion ? {} : { scale: 0.9 }}
                onClick={() => audioService.speak(currentWay?.title ?? currentWay?.name ?? '')}
                style={{
                  background: '#fff', border: '2px solid #E8E9FF',
                  borderRadius: '50%', width: 44, height: 44, fontSize: 18,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(79,70,229,0.1)'
                }}
              >
                🔊
              </motion.button>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loader" className="w-full max-w-md aspect-video bg-slate-50 animate-pulse rounded-[32px] mx-auto flex items-center justify-center">
              <span className="text-slate-300 font-bold">Cargando...</span>
            </div>
          ) : currentWay && (
            <motion.div
              key={currentWay.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <WayRenderer
                way={currentWay}
                onComplete={handleWayComplete}
                activeBoostId={selectedBoostId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ── Celebration overlay ─────────────────────────────────────── */}
      <CelebrationOverlay
        show={celebration.show}
        type={celebration.type}
        coins={celebration.coins}
        onComplete={handleCelebrationDone}
      />
      {/* ── Milestone overlay ────────────────────────────────────────── */}
      <MilestoneOverlay
        show={showMilestone}
        title="¡MÓDULO COMPLETADO!"
        subtitle={`Has superado todos los retos de ${step.title}. ¡Eres increíble!`}
        onClose={() => {
          setShowMilestone(false);
          navigate(`/play/${levelId}/${stepId}`);
        }}
      />
      {/* ── Boost Selector ─────────────────────────────────────────── */}
      {showBoostSelector && (
        <BoostSelector
          ownedBoosts={ownedBoosts}
          selectedBoostId={selectedBoostId}
          onSelect={setSelectedBoostId}
          onStart={handleStartWithBoost}
        />
      )}

      <HomeworkCelebration
        show={showHomeworkCelebration}
        playerName={profile?.name || ''}
        playerAvatar={profile?.avatar || ''}
        onComplete={() => setShowHomeworkCelebration(false)}
      />
    </>
  );
}
