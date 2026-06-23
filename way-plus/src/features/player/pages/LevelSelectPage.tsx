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

  // Compute current way
  // El primer way de todos los steps que no está completado
  const currentWayId = useMemo(() => {
    for (const step of steps) {
      if (!step.ways) continue;
      for (const way of step.ways) {
        if (!completedWays.includes(way.id)) return way.id;
      }
    }
    return null;
  }, [steps, completedWays]);

  const totalWays = steps.reduce((acc, s) => acc + (s.ways?.length ?? 0), 0);
  const totalDone = completedWays.length;
  const globalPct = totalWays > 0 ? Math.round((totalDone / totalWays) * 100) : 0;

  // Flatten ways to find homework ways efficiently
  const allWays = useMemo(() => steps.flatMap(s => s.ways || []), [steps]);
  
  // Respetar el orden exacto (Drag&Drop) en el que Maite guardó las tareas
  const activeHomeworks = useMemo(() => {
    return Array.from(homeworkIds)
      .map(id => allWays.find(w => w.id === id))
      .filter(Boolean) as Way[];
  }, [homeworkIds, allWays]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF0] to-[#F0F4FF] pb-32 relative font-[Verdana,sans-serif]">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-black/5 border-none text-gray-400 text-xs font-black cursor-pointer flex items-center justify-center touch-manipulation hover:bg-black/10 active:scale-95 transition-all z-50"
      >
        SALIR
      </button>

      {/* Header Avatar & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-10 pb-6 px-6 flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-indigo-500/10 flex items-center justify-center text-5xl"
        >
          {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
        </motion.div>

        <div className="text-center">
          <div className="text-3xl font-black text-[#1E1B4B]">
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </div>
          <div className="text-base text-gray-500 font-bold mt-1">
            ¿Qué aprendemos hoy?
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg shadow-amber-500/40"
        >
          <span className="text-3xl">🪙</span>
          <span className="text-xl font-black text-white">
            {wayCoins ?? 0} medallas
          </span>
        </motion.div>
      </motion.div>

      {/* Tu Camino de Hoy (Homework) */}
      {activeHomeworks.length > 0 && (
        <div className="px-6 mb-12 max-w-2xl mx-auto">
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
                  whileTap={{ scale: 0.97 }}
                  onPointerDown={() => handleWayClick(way.id)}
                  className={`
                    relative rounded-[40px] h-36 px-6 flex items-center gap-6 cursor-pointer overflow-hidden touch-manipulation select-none
                    ${isDone ? 'bg-[#F1F2FF] border-4 border-[#E8E9FF]' : 'bg-white border-[6px] border-amber-400 shadow-xl shadow-amber-500/20'}
                  `}
                >
                  {!isDone && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                         style={{ backgroundImage: 'linear-gradient(45deg, #F59E0B 25%, transparent 25%, transparent 50%, #F59E0B 50%, #F59E0B 75%, transparent 75%, transparent)', backgroundSize: '24px 24px' }} />
                  )}

                  <div className={`text-6xl ${isDone ? 'grayscale opacity-50' : ''}`}>
                    {way.id?.includes('relaxation') ? '🧘' : way.id?.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div className="flex-1 min-w-0 z-10">
                    <div className={`text-2xl font-black leading-tight ${isDone ? 'text-gray-500' : 'text-[#1E1B4B]'}`}>
                      {normalizeWayText(way.title)}
                    </div>
                    <div className={`text-base font-black mt-2 ${isDone ? 'text-gray-400' : 'text-amber-500'}`}>
                      {isDone ? '✓ ¡LOGRADO!' : 'EJERCICIO ESPECIAL'}
                    </div>
                  </div>

                  {!isDone && (
                    <motion.div 
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl text-amber-500 z-10"
                    >
                      ▶
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map (WayPath) */}
      <div className="px-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-8">
            {[1, 2].map(i => <div key={i} className="h-64 rounded-[40px] bg-white/60 animate-pulse" />)}
          </div>
        ) : (
          <WayPath
            steps={steps.map(step => {
              const stepWays = step.ways || [];
              const doneCount = stepWays.filter(w => completedWays.includes(w.id)).length;
              
              // Helper to check if way is unlocked.
              // Logic: A way is unlocked if it's the current way, OR it's completed, OR we don't have strict progression enabled.
              // For simplicity, anything up to currentWayId is unlocked. Anything after is locked.
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
                  
                  // Si ya pasamos el currentWayId, están bloqueados
                  // Si el currentWayId no está en este step, y no tenemos ninguno completado, asumimos bloqueado a menos que sea el step 1.
                  // Usaremos una lógica sencilla: si no está completado y no es current, y foundCurrent es true, está bloqueado.
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
              <motion.div
                key={i}
                initial={{ y: 0, x: (i - 2) * 80, opacity: 1, scale: 0 }}
                animate={{ y: -400, opacity: 0, scale: 2 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                className="absolute text-6xl"
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
