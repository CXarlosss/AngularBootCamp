import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { audioService } from '@/core/utils/audioService';
import type { Step, Way } from '@/core/engine/types';
import { patientService } from '@/core/services/patientService';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { WayPath } from '../components/WayPath';

const DECORATIVE_BLOBS = (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-300/20 rounded-full blur-[80px] animate-blob-float mix-blend-multiply" />
    <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[100px] animate-blob-float mix-blend-multiply" style={{ animationDelay: '2s' }} />
  </div>
);

export const LevelSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const currentLevel = profile?.currentLevel || 'pregamer';
  const wayCoins = useRewardsStore(s => s.wayCoins);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [homeworkIds, setHomeworkIds] = useState<Set<string>>(new Set());

  const completedWays = useMemo(() => {
    return Array.isArray(profile?.completedWays) ? profile.completedWays : [];
  }, [profile?.completedWays]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('way-active-patient');
    window.location.href = '/player';
  }, []);

  useEffect(() => {
    const patientId = sessionStorage.getItem('way-active-patient');
    if (!profile?.currentLevel) return;
    
    setLoading(true);
    registry.getStepsForLevel(profile.currentLevel)
      .then(res => setSteps(Array.isArray(res) ? res : []))
      .catch(err => console.error('[WAY+] Error loading steps:', err))
      .finally(() => setLoading(false));

    if (patientId) {
      patientService.getHomework(patientId).then(ids => {
        setHomeworkIds(new Set(ids));
      });
    }
  }, [profile?.currentLevel]);

  useEffect(() => {
    if (completedWays.length > 0 && completedWays.length % 5 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [completedWays.length]);

  const handleWayClick = useCallback((wayId: string) => {
    try { audioService.playSFX('click'); } catch(e) {}
    requestAnimationFrame(() => navigate(`/play/way/${wayId}`));
  }, [navigate]);

  const currentWayId = useMemo(() => {
    for (const step of steps) {
      if (!step.ways) continue;
      for (const way of step.ways) {
        if (!completedWays.includes(way.id)) return way.id;
      }
    }
    return null;
  }, [steps, completedWays]);

  const allWays = useMemo(() => steps.flatMap(s => s.ways || []), [steps]);
  
  const activeHomeworks = useMemo(() => {
    return Array.from(homeworkIds)
      .map(id => allWays.find(w => w.id === id))
      .filter(Boolean) as Way[];
  }, [homeworkIds, allWays]);

  const wayPathSteps = useMemo(() => steps.map(step => {
    const stepWays = step.ways || [];
    const doneCount = stepWays.filter(w => completedWays.includes(w.id)).length;
    let foundCurrent = false;
    
    return {
      step: step.stepNumber || 0,
      title: step.title || '',
      totalWays: stepWays.length,
      completedCount: doneCount,
      nodes: stepWays.map((way, idx) => {
        const isCompleted = completedWays.includes(way.id);
        const isCurrent = way.id === currentWayId;
        if (isCurrent) foundCurrent = true;
        const isLocked = !isCompleted && !isCurrent && foundCurrent;
        
        return {
          id: way.id || '',
          step: step.stepNumber || 0,
          wayNumber: way.wayNumber || (idx + 1),
          title: way.title || '',
          isCompleted,
          isCurrent,
          isLocked
        };
      })
    };
  }), [steps, completedWays, currentWayId]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative font-[Verdana,sans-serif] overflow-hidden">
      {DECORATIVE_BLOBS}

      <button
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        className="absolute top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md text-slate-700 text-xl font-black cursor-pointer flex items-center justify-center touch-manipulation hover:bg-white active:scale-95 transition-[transform,background-color] duration-150 z-50 border-[3px] border-slate-200/60 shadow-sm focus-visible:ring-4 ring-violet-400/50"
      >
        🚪
      </button>

      {/* Header Avatar & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-16 sm:pt-20 pb-8 px-6 flex flex-col items-center gap-4 relative z-10"
      >
        <motion.div 
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/80 backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl drop-shadow-md border-[3px] border-slate-200/60">
            {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
          </div>
        </motion.div>

        <div className="text-center mt-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-bold mt-1 tracking-wide">
            ¿Qué aprendemos hoy?
          </p>
        </div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center gap-3 mt-2 border-[3px] border-amber-200/60 shadow-sm cursor-pointer"
        >
          <span className="text-3xl sm:text-4xl drop-shadow-sm">🪙</span>
          <span className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
            {wayCoins ?? 0}
          </span>
        </motion.div>
      </motion.div>

      {/* Tu Camino de Hoy (Homework) */}
      {activeHomeworks.length > 0 && (
        <div className="px-4 sm:px-6 mb-12 max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl sm:text-3xl drop-shadow-sm">🏠</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-wide">Tu camino de hoy</h2>
          </div>
          
          <div className="flex flex-col gap-4 sm:gap-6">
            {activeHomeworks.map(way => {
              const isDone = completedWays.includes(way.id);
              return (
                <motion.button
                  key={way.id}
                  whileTap={!isDone ? { scale: 0.97 } : {}}
                  onPointerDown={() => handleWayClick(way.id)}
                  className={`
                    relative w-full h-auto min-h-[120px] p-6 flex items-center gap-4 sm:gap-6 rounded-[2rem] text-left transition-[transform,shadow] duration-150 focus-visible:ring-4 ring-violet-400/50
                    ${isDone ? 'bg-white/80 border-[3px] border-slate-200/60' : 'bg-gradient-to-r from-amber-400 to-orange-400 border-[3px] border-amber-300 shadow-md hover:shadow-lg'}
                  `}
                >
                  <div className={`text-4xl sm:text-5xl shrink-0 ${isDone ? 'grayscale opacity-50' : 'drop-shadow-md'}`}>
                    {way.id?.includes('relaxation') ? '🧘' : way.id?.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div className="flex-1 min-w-0 z-10">
                    <h3 className={`text-lg sm:text-xl lg:text-2xl font-black leading-tight tracking-tight ${isDone ? 'text-slate-400' : 'text-white drop-shadow-sm'}`}>
                      {normalizeWayText(way.title)}
                    </h3>
                    <p className={`text-xs sm:text-sm lg:text-base font-bold mt-2 uppercase tracking-wider ${isDone ? 'text-slate-400' : 'text-amber-100'}`}>
                      {isDone ? '✓ Logrado' : 'Ejercicio Especial'}
                    </p>
                  </div>

                  {!isDone && (
                    <motion.div 
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="text-3xl sm:text-4xl text-amber-100 z-10 font-black shrink-0"
                    >
                      ›
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map (WayPath) */}
      <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : (
          <WayPath
            steps={wayPathSteps}
            onWayClick={handleWayClick}
          />
        )}
      </div>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-[999]"
          >
            {['🎉', '⭐', '🌟', '🎊', '✨'].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ y: "100vh", x: `${50 + (i - 2) * 15}vw` }}
                animate={{ y: "-10vh", x: `${50 + (i - 2) * 20}vw` }}
                transition={{ duration: 2, delay: i * 0.1, type: "spring" }}
                className="absolute text-5xl sm:text-6xl drop-shadow-lg"
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
