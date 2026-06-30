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

export const LevelSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const currentLevel = profile?.currentLevel || 'pregamer';
  const wayCoins = useRewardsStore(s => s.wayCoins);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [homeworkIds, setHomeworkIds] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const patientId = sessionStorage.getItem('way-active-patient');
    if (patientId && profile?.name) {
      localStorage.setItem('way-last-patient-id', patientId);
      localStorage.setItem('way-last-patient-name', profile.name);
    }
  }, [profile]);
  
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
    
    let targetStepId = '';
    for (const step of steps) {
      if (step.ways?.some(w => w.id === wayId)) {
        targetStepId = step.id;
        break;
      }
    }
    
    if (targetStepId) {
      requestAnimationFrame(() => navigate(`/play/${currentLevel}/${targetStepId}/${wayId}`));
    } else {
      requestAnimationFrame(() => navigate(`/play/way/${wayId}`));
    }
  }, [navigate, steps, currentLevel]);

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
    <div data-testid="level-select-page" className="min-h-screen bg-slate-50 pb-20 relative font-[Verdana,sans-serif]">
      {/* Logout */}
      <button
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        data-testid="logout-button"
        className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white text-slate-500 text-base flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95 transition-transform duration-150 z-50 border border-slate-200 shadow-sm focus-visible:ring-2 ring-violet-400/40"
      >
        🚪
      </button>

      {/* Header */}
      <div className="pt-8 sm:pt-10 pb-4 px-4 flex flex-col items-center gap-2 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm border border-slate-200">
          {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
        </div>
        
        <div className="text-center">
          <h1 className="text-base font-bold text-slate-800 leading-normal">
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            ¿Qué aprendemos hoy?
          </p>
        </div>
        
        <div data-testid="coin-display" className="bg-white rounded-xl px-3 py-1.5 flex items-center gap-2 border border-amber-200 shadow-sm cursor-pointer active:scale-95 transition-transform duration-150">
          <span className="text-lg">🪙</span>
          <span className="text-base font-bold text-amber-600">
            {wayCoins ?? 0}
          </span>
        </div>
      </div>

      {/* Homework Section */}
      {activeHomeworks.length > 0 && (
        <div className="px-4 sm:px-6 mb-6 max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏠</span>
            <h2 className="text-sm font-bold text-slate-700">Tu camino de hoy</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {activeHomeworks.map(way => {
              const isDone = completedWays.includes(way.id);
              return (
                <button
                  key={way.id}
                  onPointerDown={() => !isDone && handleWayClick(way.id)}
                  data-testid={`homework-way-${way.id}`}
                  className={`
                    relative w-full p-3 min-h-[44px] flex items-center gap-3 rounded-xl text-left transition-all duration-150 focus-visible:ring-2 ring-violet-400/40 active:scale-95
                    ${isDone 
                      ? 'bg-slate-100 border border-slate-200' 
                      : 'bg-white border-2 border-violet-200 shadow-sm hover:border-violet-300'}
                  `}
                >
                  <div className={`text-lg shrink-0 ${isDone ? 'grayscale opacity-40' : ''}`}>
                    {way.id?.includes('relaxation') ? '🧘' : way.id?.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold leading-normal ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>
                      {normalizeWayText(way.title)}
                    </h3>
                    <p className={`text-xs font-semibold mt-0.5 ${isDone ? 'text-slate-400' : 'text-violet-500'}`}>
                      {isDone ? '✓ Completado' : 'Ejercicio especial'}
                    </p>
                  </div>
                  
                  {!isDone && (
                    <span className="text-lg text-violet-400 font-bold shrink-0">
                      ›
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
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
                className="absolute text-lg"
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
