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

import { normalizeWayText } from '@/shared/lib/way-text-utils';

/* ─── Back button ────────────────────────────────────────────────────── */
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-12 h-12 rounded-full header-glass flex items-center justify-center text-xl hover:bg-white/90 active:scale-95 transition-all group"
    >
      <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
    </button>
  );
}

function WayProgressIndicator({ current, total }: { current: number, total: number }) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-32 sm:w-48 progress-liquid">
      <div 
        className="progress-liquid__fill"
        style={{ width: `${percent}%` }}
      />
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
  const celebrateCompletion = useRewardsStore(s => s.celebrateCompletion);
  const addCoins = useRewardsStore(s => s.addCoins);
  const checkAndUpdateStreak = useRewardsStore(s => s.checkAndUpdateStreak);
  const dailyChallenge = usePlayerStore(s => s.dailyChallenge);
  const completeDailyChallenge = usePlayerStore(s => s.completeDailyChallenge);
  const profile = usePlayerStore(s => s.profile);

  const [celebration, setCelebration] = useState<{
    show: boolean; type: 'happy' | 'sad' | 'step-complete' | 'annex-complete'; coins: number;
  }>({ show: false, type: 'happy', coins: 0 });

  const [showMilestone, setShowMilestone] = useState(false);

  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoostSelector, setShowBoostSelector] = useState(false);
  const [selectedBoostId, setSelectedBoostId] = useState<string | null>(null);
  const ownedBoosts = useRewardsStore(s => s.ownedBoosts);
  const consumeBoost = useRewardsStore(s => s.consumeBoost);
  
  // Performance timer state
  const [loadTime, setLoadTime] = useState(0);
  const loadingTimerRef = useRef<any>(null);

  // Load step from registry with robust fallback
  useEffect(() => {
    if (!stepId || !levelId) return;

    const loadStep = async (forceCloud = false) => {
      const startTime = performance.now();
      setLoading(true);
      setLoadTime(0);
      
      // Start UI timer
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = setInterval(() => {
        setLoadTime(prev => prev + 100);
      }, 100);

      try {
        console.log(`[WayPlayer] 🚀 Cargando contenido: ${stepId} (ForceCloud: ${forceCloud})...`);
        
        let foundStep: Step | null = null;
        
        if (forceCloud) {
          // If forced, we go straight to cloud and wait
          await registry.syncFromCloud(levelId);
          foundStep = await registry.getStepByIdAsync(stepId);
        } else {
          // Normal flow: memory/idb/local
          foundStep = await registry.getStepByIdAsync(stepId);
          
          // If not found and we are online, try a quick level sync
          if (!foundStep && navigator.onLine) {
            console.log('[WayPlayer] 🔍 Contenido no encontrado localmente, intentando descarga de emergencia...');
            await registry.getStepsForLevel(levelId); // This triggers cloud fetch if cache is empty
            foundStep = await registry.getStepByIdAsync(stepId);
          }
        }
        
        // Final fallback: check the level steps again
        if (!foundStep) {
          const levelSteps = await registry.getStepsForLevel(levelId);
          foundStep = levelSteps.find(s => s.id === stepId) || null;
        }
        
        setStep(foundStep);
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`[WayPlayer] ✅ Contenido cargado en ${duration}ms`);
      } catch (err) {
        console.error('[WayPlayer] Error crítico de carga:', err);
      } finally {
        if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
        setLoading(false);
      }
    };

    loadStep();
  }, [stepId, levelId]);

  const ways: Way[] = step?.ways ?? [];
  const currentIdx = useMemo(() => {
    if (!wayId) return 0;
    const idx = ways.findIndex(w => w.id === wayId);
    return idx === -1 ? 0 : idx;
  }, [wayId, ways]);
  
  const currentWay = ways[currentIdx] ?? null;
  const isLastWay = currentIdx === ways.length - 1;

  // Predictive prefetching for the next way
  useEffect(() => {
    const nextIdx = currentIdx + 1;
    const nextWay = ways[nextIdx];
    if (nextWay && nextWay.id) {
      const urls = [
        nextWay.stimulus?.image,
        ...(nextWay.options?.map(o => o.image) || [])
      ].filter((u): u is string => typeof u === 'string');
      
      // Preload specific pictograms
      import('@/core/utils/preloadService').then(({ preloadImages }) => {
        const startPreload = performance.now();
        preloadImages(urls)
          .then(() => {
            if (import.meta.env.DEV) {
              const endPreload = performance.now();
              console.log(`[Timer] 📦 Preload exitoso para ${nextWay.id} (${urls.length} imgs) en ${(endPreload - startPreload).toFixed(2)}ms`);
            }
          })
          .catch((err) => {
            if (import.meta.env.DEV) {
              console.warn(`[Timer] ❌ Fallo de precarga en ${nextWay.id}:`, err);
              console.warn('URLs fallidas:', urls);
            }
          });
      });

      // Preload situational image (background)
      import('@/core/services/wayImageService').then(({ preloadWayImages }) => {
        const preload = () => {
          preloadWayImages(nextWay.stepNumber || step?.stepNumber || 1, nextWay.wayNumber || (nextIdx + 1));
        };
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(preload, { timeout: 2000 });
        } else {
          setTimeout(preload, 1000);
        }
      });
    }
  }, [currentIdx, ways, step]);

  // Lectura automática al entrar
  useEffect(() => {
    if (currentWay && !celebration.show) {
      const textToSpeak = currentWay.title || currentWay.name || currentWay.stimulus?.text || '';
      const timer = setTimeout(() => {
        audioService.speak(normalizeWayText(textToSpeak));
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
          theme: currentWay.theme,
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
          theme: currentWay.theme,
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

  if (!step || !currentWay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#F8FAFF] relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-200 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] pointer-events-none"
        />

        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative mb-12"
        >
          <div className="text-[140px] filter drop-shadow-2xl select-none">🧩</div>
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 text-5xl"
          >
            ✨
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-2 -left-2 text-3xl"
          >
            🔍
          </motion.div>
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-black text-slate-800 mb-6 tracking-tight max-w-lg leading-tight"
        >
          ¡Ups! Este reto se ha escondido
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 font-medium text-lg mb-12 max-w-sm leading-relaxed"
        >
          No te preocupes, estamos buscando el camino correcto para ti. A veces los retos juegan al escondite.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 relative z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/play/${levelId}/${stepId}`)}
            className="bg-white text-slate-600 border-2 border-slate-100 px-10 py-5 rounded-[2.5rem] font-black text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
          >
            <span>🔙</span> VOLVER AL MÓDULO
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            <span>🚀</span> INTENTAR DE NUEVO
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]"
        >
          Error ID: {stepId || 'unknown'}-{wayId || 'index'}
        </motion.div>
      </div>
    );
  }

  // Determinar tema basado en el tipo de step o way
  const themeClass = currentWay.id?.includes('relaxation') 
    ? 'bg-theme--relaxation' 
    : currentWay.id?.includes('assertiveness') 
    ? 'bg-theme--assertiveness' 
    : 'bg-theme--autonomy';

  const titleGradientClass = currentWay.id?.includes('relaxation') 
    ? 'title-gradient--relaxation' 
    : currentWay.id?.includes('assertiveness') 
    ? 'title-gradient--assertiveness' 
    : 'title-gradient--autonomy';

  return (
    <div className={`min-h-screen ${themeClass} bg-dynamic relative overflow-y-auto`} style={{ fontFamily: 'Verdana, sans-serif' }}>
      {/* ── Top bar - Immersive Glass ── */}
      <div className="sticky top-0 z-[60] header-immersive p-4 flex items-center justify-between gap-4">
        <BackButton onPress={() => navigate(`/play/${levelId}/${stepId}`)} />
        <WayProgressIndicator
          current={currentIdx + 1}
          total={ways.length}
        />
      </div>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-4xl mx-auto pt-4 pb-24">
        {/* Mission Briefing Title */}
        <div className="px-6 mb-6 sm:mb-10">
          <div className="flex flex-col items-center text-center gap-3">
             <div className="mission-badge">
               <span className="mission-badge__dot" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Misión en Curso</span>
             </div>
             
             <div className="flex items-center gap-4">
                <h1 className={`text-3xl sm:text-5xl font-black ${titleGradientClass} leading-tight tracking-tight`}>
                  {normalizeWayText(currentWay?.title ?? currentWay?.name ?? currentWay?.stimulus?.text ?? 'Reto')}
                </h1>
                
                <button
                  onClick={() => {
                    const text = currentWay?.title || currentWay?.name || currentWay?.stimulus?.text || '';
                    audioService.speak(normalizeWayText(text));
                  }}
                  className="voice-btn"
                >
                  🔊
                </button>
             </div>
             
             <p className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest mt-2">
               {step.title} • Reto {currentIdx + 1} de {ways.length}
             </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loader" className="w-full max-w-md aspect-video stimulus-card mx-auto flex flex-col items-center justify-center gap-6">
               <div className="loader-orbit">
                 <div className="loader-orbit__ring" />
                 <div className="loader-orbit__center">
                   {currentWay.id?.includes('relaxation') ? '🧘' : currentWay.id?.includes('assertiveness') ? '🗣️' : '✨'}
                 </div>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <span className="text-indigo-900/60 font-black uppercase tracking-[0.2em] text-sm">Preparando Reto...</span>
                 <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black font-mono">
                   { (loadTime / 1000).toFixed(1) }s
                 </div>
               </div>
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

      <HomeworkCelebration
        show={showHomeworkCelebration}
        playerName={profile?.name || ''}
        playerAvatar={profile?.avatar || ''}
        onComplete={() => setShowHomeworkCelebration(false)}
      />
    </div>
  );
}

