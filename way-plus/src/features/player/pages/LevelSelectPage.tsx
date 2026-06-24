import React, { useMemo, useEffect, useState } from 'react';
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

  const handleLogout = () => {
    sessionStorage.removeItem('way-active-patient');
    window.location.href = '/player';
  };

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

  const handleWayClick = (wayId: string) => {
    audioService.playSFX('click');
    navigate(`/play/way/${wayId}`);
  };

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

  return (
    <div className="min-h-screen bg-dynamic bg-dynamic--normal pb-32 relative font-[Verdana,sans-serif] overflow-hidden">
      {/* Elementos decorativos orgánicos */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-300/30 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-[120px] animate-blob-delayed mix-blend-multiply pointer-events-none" />

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 w-12 h-12 rounded-2xl header-glass text-indigo-900 text-xs font-black cursor-pointer flex items-center justify-center touch-manipulation hover:bg-white/80 active:scale-95 transition-all z-50"
      >
        <span className="text-xl">🚪</span>
      </button>

      {/* Header Avatar & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-8 px-6 flex flex-col items-center gap-4 relative z-10"
      >
        <div className="avatar-float">
          <div className="w-28 h-28 rounded-3xl header-glass flex items-center justify-center text-6xl glow-soft">
            {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
          </div>
        </div>

        <div className="text-center mt-2">
          <div className="text-4xl font-black text-[#1E1B4B] tracking-tight">
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </div>
          <div className="text-lg text-indigo-900/60 font-bold mt-1">
            ¿Qué aprendemos hoy?
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="header-glass rounded-2xl px-6 py-3 flex items-center gap-3 mt-2"
        >
          <span className="text-4xl coin-3d drop-shadow-md">🪙</span>
          <span className="text-2xl font-black text-amber-500">
            {wayCoins ?? 0}
          </span>
        </motion.div>
      </motion.div>

      {/* Tu Camino de Hoy (Homework) */}
      {activeHomeworks.length > 0 && (
        <div className="px-6 mb-12 max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏠</span>
            <span className="text-xl font-black text-[#1E1B4B] uppercase tracking-wide">Tu camino de hoy</span>
          </div>
          
          <div className="flex flex-col gap-6">
            {activeHomeworks.map(way => {
              const isDone = completedWays.includes(way.id);
              return (
                <motion.div
                  key={way.id}
                  whileTap={!isDone ? { scale: 0.97 } : {}}
                  onPointerDown={() => handleWayClick(way.id)}
                  className={`
                    h-36 px-6 flex items-center gap-6 
                    ${isDone ? 'homework-card homework-card--done' : 'homework-card bg-amber-400 text-white'}
                  `}
                >
                  {!isDone && (
                    <div className="absolute inset-0 pattern-homework pointer-events-none opacity-50" />
                  )}

                  <div className={`text-6xl ${isDone ? 'grayscale opacity-50' : 'drop-shadow-lg'}`}>
                    {way.id?.includes('relaxation') ? '🧘' : way.id?.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div className="flex-1 min-w-0 z-10">
                    <div className={`text-2xl font-black leading-tight ${isDone ? 'text-gray-400' : 'text-white drop-shadow-sm'}`}>
                      {normalizeWayText(way.title)}
                    </div>
                    <div className={`text-sm font-bold mt-2 uppercase tracking-wider ${isDone ? 'text-gray-400' : 'text-amber-100'}`}>
                      {isDone ? '✓ Logrado' : 'Ejercicio Especial'}
                    </div>
                  </div>

                  {!isDone && (
                    <motion.div 
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl text-amber-100 z-10 font-black"
                    >
                      ›
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map (WayPath) */}
      <div className="px-6 max-w-4xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner-glass" />
          </div>
        ) : (
          <WayPath
            steps={steps.map(step => {
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
            })}
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
              <div
                key={i}
                className="celebration-particle"
                style={{ 
                  left: `${50 + (i - 2) * 15}%`, 
                  animationDelay: `${i * 0.1}s` 
                }}
              >
                {emoji}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
