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

import { WayPath } from '@/features/player/components/WayPath';
import { normalizeWayText } from '@/shared/lib/way-text-utils';

/* ─── Back button ────────────────────────────────────────────────────── */
/* ─── Back button ────────────────────────────────────────────────────── */
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
      className="flex items-center gap-2 bg-white/90 backdrop-blur-md border-2 border-slate-100 rounded-2xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all active:translate-y-0.5 group"
    >
      <span className="text-xl group-hover:-translate-x-1 transition-transform">🔙</span>
      <span className="font-black text-xs text-slate-600 uppercase tracking-widest">Salir</span>
    </motion.button>
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
      const timer = setTimeout(() => {
        audioService.speak(normalizeWayText(currentWay.title ?? currentWay.name ?? ''));
      }, 800);
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
      celebrateCompletion('step');
      setShowMilestone(true);
    } else {
      celebrateCompletion('way');
      
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50">
        <div className="text-8xl mb-6">🔍</div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">¡Vaya! No encontramos el reto</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-xl"
        >
          VOLVER AL INICIO
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] relative overflow-y-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Immersive Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-50 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, -50, 0], 
            y: [0, 50, 100, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 50, 0], 
            y: [0, -50, -100, 0],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"
        />
      </div>

      {/* ── Top bar - Premium Glass ── */}
      <div className="sticky top-0 z-[60] bg-white/60 backdrop-blur-2xl border-b border-white/20 p-4 flex items-center justify-between gap-4 shadow-[0_1px_20px_rgba(0,0,0,0.02)]">
        <BackButton onPress={() => navigate(`/play/${levelId}/${stepId}`)} />
        <WayPath
          current={currentIdx + 1}
          total={ways.length}
        />
      </div>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-4xl mx-auto pt-2 pb-24">
        {/* Mission Briefing Title - Compacted for mobile */}
        <div className="px-6 mb-4 sm:mb-8">
          <div className="flex flex-col items-center text-center gap-2 sm:gap-4">
             <div className="inline-flex items-center gap-2 bg-indigo-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-indigo-100">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Misión en Curso</span>
             </div>
             
             <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight tracking-tight">
                  {normalizeWayText(currentWay?.title ?? currentWay?.name ?? 'Reto')}
                </h1>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => audioService.speak(normalizeWayText(currentWay?.title ?? currentWay?.name ?? ''))}
                  className="w-10 h-10 sm:w-14 sm:h-14 bg-white border-2 border-indigo-50 rounded-2xl shadow-md flex items-center justify-center text-xl hover:bg-indigo-50 transition-colors"
                >
                  🔊
                </motion.button>
             </div>
             
             <p className="text-slate-400 font-bold text-[10px] sm:text-sm uppercase tracking-widest opacity-60">
               {step.title} • {currentIdx + 1} / {ways.length}
             </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loader" className="w-full max-w-md aspect-video bg-white/50 backdrop-blur-md animate-pulse rounded-[3rem] mx-auto flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200">
               <div className="text-4xl">🚀</div>
               <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Preparando Reto...</span>
            </div>
          ) : (
            <motion.div
              key={currentWay.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <WayRenderer
                way={currentWay}
                onComplete={handleWayComplete}
                activeBoostId={selectedBoostId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Overlays ── */}
      <CelebrationOverlay
        show={celebration.show}
        type={celebration.type}
        coins={celebration.coins}
        onComplete={handleCelebrationDone}
      />
      
      <MilestoneOverlay
        show={showMilestone}
        title="¡MÓDULO COMPLETADO!"
        subtitle={`Has superado todos los retos de ${step.title}. ¡Eres increíble!`}
        onClose={() => {
          setShowMilestone(false);
          navigate(`/play/${levelId}/${stepId}`);
        }}
      />

      <AnimatePresence>
        {showBoostSelector && (
          <BoostSelector
            ownedBoosts={ownedBoosts}
            selectedBoostId={selectedBoostId}
            onSelect={setSelectedBoostId}
            onStart={handleStartWithBoost}
          />
        )}
      </AnimatePresence>

      <HomeworkCelebration
        show={showHomeworkCelebration}
        playerName={profile?.name || ''}
        playerAvatar={profile?.avatar || ''}
        onComplete={() => setShowHomeworkCelebration(false)}
      />
    </div>
  );
}

