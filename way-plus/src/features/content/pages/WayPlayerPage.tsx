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
import { HomeworkCelebration } from '@/features/player/components/HomeworkCelebration';
import { homeworkService } from '@/core/services/homeworkService';
import { syncService } from '@/core/services/syncService';
import { posthogTracker } from '@/core/services/posthogService';
import type { Step, Way } from '@/core/engine/types';
import { cn } from '@/shared/lib/utils';
import { T, Emoji } from '@/shared/components/TypographyScale';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/Button';
import { rw } from '@/shared/lib/wayResponsive';

const SESSION_DURATION = 15 * 60;
const WARNING_THRESHOLD = 3 * 60;

function getSessionTimeLeft(): number {
  const start = sessionStorage.getItem('way-session-start');
  if (!start) {
    sessionStorage.setItem('way-session-start', Date.now().toString());
    return SESSION_DURATION;
  }
  const elapsed = Math.floor((Date.now() - parseInt(start)) / 1000);
  return Math.max(0, SESSION_DURATION - elapsed);
}

export function WayPlayerPage() {
  const { levelId, stepId, wayId } = useParams<{ levelId: string; stepId: string; wayId: string }>();
  const navigate = useNavigate();
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
  const [showHomeworkCelebration, setShowHomeworkCelebration] = useState(false);
  const [isHomework, setIsHomework] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getSessionTimeLeft());
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const sessionEndedRef = useRef(false);
  const wayStartTime = useRef<number>(Date.now());

  // Timer global
  useEffect(() => {
    const interval = setInterval(() => {
      const left = getSessionTimeLeft();
      setTimeLeft(left);
      
      if (left <= WARNING_THRESHOLD && left > 0) {
        setShowTimeWarning(true);
      }
      
      if (left <= 0 && !sessionEndedRef.current) {
        sessionEndedRef.current = true;
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load step
  useEffect(() => {
    if (!stepId || !levelId) return;
    
    const loadStep = async () => {
      setLoading(true);
      try {
        let foundStep = await registry.getStepByIdAsync(stepId);
        if (!foundStep && navigator.onLine) {
          await registry.getStepsForLevel(levelId);
          foundStep = await registry.getStepByIdAsync(stepId);
        }
        if (!foundStep) {
          const levelSteps = await registry.getStepsForLevel(levelId);
          foundStep = levelSteps.find(s => s.id === stepId) || null;
        }
        setStep(foundStep);
      } catch (err) {
        console.error('[WayPlayer] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStep();
  }, [stepId, levelId]);

  // Check homework
  useEffect(() => {
    const patientId = sessionStorage.getItem('way-active-patient');
    if (patientId && wayId && levelId && stepId) {
      homeworkService.isHomework(patientId, wayId).then(isHw => {
        setIsHomework(isHw);
        posthogTracker.trackWayStarted(levelId, stepId, wayId, isHw);
      });
    }
  }, [wayId, levelId, stepId]);

  // Reset timer on new way
  useEffect(() => {
    wayStartTime.current = Date.now();
  }, [wayId]);

  // Derived state
  const ways: Way[] = step?.ways ?? [];
  const currentIdx = useMemo(() => {
    if (!wayId) return 0;
    const idx = ways.findIndex(w => w.id === wayId);
    return idx === -1 ? 0 : idx;
  }, [wayId, ways]);
  
  const currentWay = ways[currentIdx] ?? null;
  const isLastWay = currentIdx === ways.length - 1;

  const handleSpeakStart = useCallback(() => setIsSpeaking(true), []);
  const handleSpeakEnd = useCallback(() => setIsSpeaking(false), []);

  const handleWayComplete = useCallback((success: boolean) => {
    if (!currentWay || !wayId || !levelId || !stepId) return;
    
    const durationSecs = Math.floor((Date.now() - wayStartTime.current) / 1000);
    posthogTracker.trackWayCompleted(levelId, stepId, wayId, durationSecs, isHomework, success);
    
    if (success) {
      completeWay(currentWay.id, 1);
      const isDaily = currentWay.id === dailyChallenge.wayId && !dailyChallenge.completed;
      const bonus = isDaily ? 30 : 0;
      
      if (isDaily) {
        completeDailyChallenge();
        addCoins(bonus, 'daily_challenge');
      }
      
      addCoins(10 + bonus, 'way_completed');
      
      if (timeLeft <= 0) {
        navigate('/session-end', { state: { reason: 'time-up' } });
        return;
      }
      
      if (isHomework) {
        setShowHomeworkCelebration(true);
        setTimeout(() => {
          const nextWay = ways[currentIdx + 1];
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
        setCelebration({ show: true, type: 'happy', coins: 10 + bonus });
        const nextWay = ways[currentIdx + 1];
        if (nextWay) {
          setTimeout(() => {
            navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
          }, 3000);
        }
      }
    }
  }, [currentWay, wayId, timeLeft, completeWay, dailyChallenge, completeDailyChallenge, addCoins, isHomework, ways, currentIdx, isLastWay, levelId, stepId, navigate, celebrateCompletion]);

  const handleCelebrationDone = () => {
    setCelebration(c => ({ ...c, show: false }));
    if (celebration.type === 'step-complete') {
      navigate(`/play/${levelId}/${stepId}`);
    }
  };

  const handleBack = useCallback(() => {
    audioService.stopSpeak();
    navigate(`/play/${levelId}/${stepId}`);
  }, [navigate, levelId, stepId]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= WARNING_THRESHOLD;
  const progressPercent = (timeLeft / SESSION_DURATION) * 100;

  if (!step || !currentWay) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 px-6">
        <Emoji>🤷</Emoji>
        <T size="base" bold>¡Ups! Este reto se ha escondido</T>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/play/${levelId}/${stepId}`)}
        >
          Volver al módulo
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: 'Verdana, sans-serif' }}>
      {/* Header */}
      <header className={rw("headerCompact", "sticky top-0 z-50 bg-white border-b border-slate-200 px-4")}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm active:scale-95 transition-transform duration-150"
            aria-label="Volver"
          >
            ←
          </button>
          
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs",
            isWarning ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          )} data-testid="timer-display">
            <span className={isWarning ? 'animate-pulse' : ''}>⏱️</span>
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          
          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs" data-testid="coin-display">
            <Emoji>⭐</Emoji>
            <span>{profile?.coins ?? 0}</span>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto mt-1 flex gap-2">
          {/* Timer Progress */}
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full rounded-full", isWarning ? 'bg-amber-500' : 'bg-violet-500')}
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          {/* Way Progress */}
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-emerald-400"
              initial={false}
              animate={{ width: `${((currentIdx + 1) / Math.max(1, ways.length)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <AnimatePresence>
          {showTimeWarning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden max-w-2xl mx-auto"
            >
              <T size="micro" bold color="warning" className="text-center py-0.5 animate-pulse">
                ⏱️ Últimos WAYs, ¡vamos a terminar!
              </T>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-2 px-4">
        {ways.map((w, i) => (
          <div 
            key={w.id} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < currentIdx ? "bg-emerald-400 w-6" : 
              i === currentIdx ? "bg-violet-500 w-8" : 
              "bg-slate-200 w-4"
            )}
          />
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full" data-testid="way-player-main">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <LoadingSpinner size="md" />
              <T size="xs" color="muted" bold>Cargando...</T>
            </div>
          ) : (
            <motion.div
              key={currentWay.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WayRenderer
                way={currentWay}
                onComplete={handleWayComplete}
                isSpeaking={isSpeaking}
                onSpeakStart={handleSpeakStart}
                onSpeakEnd={handleSpeakEnd}
                sessionEnding={timeLeft <= 0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <CelebrationOverlay
        show={celebration.show}
        type={celebration.type}
        coins={celebration.coins}
        onComplete={handleCelebrationDone}
      />
      
      <MilestoneOverlay
        show={showMilestone}
        title="¡Módulo completado!"
        subtitle={`Has superado todos los retos de ${step.title}`}
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
