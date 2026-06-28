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
    <div className="absolute top-[-5%] left-[-5%] w-[280px] h-[280px] bg-violet-200/30 rounded-full blur-[60px] animate-blob-float" />
    <div className="absolute bottom-[20%] right-[-5%] w-[320px] h-[320px] bg-teal-200/30 rounded-full blur-[60px] animate-blob-float" style={{ animationDelay: '2s' }} />
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
    <div className="min-h-screen bg-slate-50 pb-28 relative font-[Verdana,sans-serif] overflow-hidden">
      {DECORATIVE_BLOBS}

      {/* Logout */}
      <button
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        data-testid="logout-button"
        className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white text-slate-500 text-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95 transition-all duration-150 z-50 border border-slate-200 shadow-sm focus-visible:ring-2 ring-violet-400/40"
      >
        🚪
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pt-12 sm:pt-16 pb-6 px-4 flex flex-col items-center gap-3 relative z-10"
      >
        <motion.div 
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-3xl sm:text-4xl shadow-sm border border-slate-200">
            {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
          </div>
        </motion.div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-semibold mt-1">
            ¿Qué aprendemos hoy?
          </p>
        </div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 border border-amber-200 shadow-sm cursor-pointer"
        >
          <span className="text-xl sm:text-2xl">🪙</span>
          <span className="text-lg sm:text-xl font-black text-amber-600 tracking-tight">
            {wayCoins ?? 0}
          </span>
        </motion.div>
      </motion.div>

      {/* Homework Section */}
      {activeHomeworks.length > 0 && (
        <div className="px-4 sm:px-6 mb-8 max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏠</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-700">Tu camino de hoy</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {activeHomeworks.map(way => {
              const isDone = completedWays.includes(way.id);
              return (
                <motion.button
                  key={way.id}
                  whileTap={!isDone ? { scale: 0.97 } : {}}
                  onPointerDown={() => handleWayClick(way.id)}
                  data-testid={`homework-way-${way.id}`}
                  className={`
                    relative w-full p-4 flex items-center gap-3 rounded-2xl text-left transition-all duration-150 focus-visible:ring-2 ring-violet-400/40
                    ${isDone 
                      ? 'bg-slate-100 border border-slate-200' 
                      : 'bg-white border-2 border-violet-200 shadow-sm hover:shadow-md hover:border-violet-300'}
                  `}
                >
                  <div className={`text-2xl sm:text-3xl shrink-0 ${isDone ? 'grayscale opacity-40' : ''}`}>
                    {way.id?.includes('relaxation') ? '🧘' : way.id?.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm sm:text-base font-bold leading-snug ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>
                      {normalizeWayText(way.title)}
                    </h3>
                    <p className={`text-xs font-semibold mt-1 ${isDone ? 'text-slate-400' : 'text-violet-500'}`}>
                      {isDone ? '✓ Completado' : 'Ejercicio especial'}
                    </p>
                  </div>

                  {!isDone && (
                    <motion.div 
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="text-xl text-violet-400 font-black shrink-0"
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

      {/* Map */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-3 border-violet-200 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <WayPath
            steps={wayPathSteps}
            onWayClick={handleWayClick}
          />
        )}
      </div>

      {/* Confetti */}
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
                className="absolute text-3xl sm:text-4xl"
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
