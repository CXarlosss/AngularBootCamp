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
import { posthogTracker } from '@/core/services/posthogService';
import type { Step, Way } from '@/core/engine/types';
import { cn } from '@/shared/lib/utils';
import { T, Emoji } from '@/shared/components/TypographyScale';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/Button';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';

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
      hapticService.success();
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
            hapticService.milestone();
            celebrateCompletion('step');
            setShowMilestone(true);
          } else if (nextWay) {
            navigate(`/play/${levelId}/${stepId}/${nextWay.id}`, { replace: true });
          } else {
            navigate(`/play/${levelId}/${stepId}`);
          }
        }, 3500);
      } else if (isLastWay) {
        hapticService.milestone();
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
    } else {
      hapticService.error();
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
      <div className={way("min-h-screen flex flex-col items-center justify-center gap-3 px-6", wayTheme.GLASS.main)}>
        <Emoji>🤷</Emoji>
        <T size="base" bold className={wayTheme.TEXT.title}>¡Ups! Este reto se ha escondido</T>
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
    <div className={way("min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]")}>
      {/* Header */}
      <header className={way("sticky top-0 z-50 px-4", wayTheme.GLASS.header)}>
        <div className={way(wayResponsive.HEADERS.headerCompact, wayResponsive.CONTAINERS.maxWidthTablet, "mx-auto")}>
          <Button
            variant="icon"
            size="sm"
            onClick={handleBack}
            aria-label="Volver"
          >
            ←
          </Button>
          
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs backdrop-blur-sm border shadow-sm",
            isWarning ? wayTheme.STATUS.warning : 'bg-white/50 border-white/20 text-slate-700'
          )} data-testid="timer-display">
            <span className={isWarning ? 'animate-pulse' : ''}>⏱️</span>
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          
          <div className="flex items-center gap-1 text-amber-600 font-bold text-sm bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 shadow-sm" data-testid="coin-display">
            <Emoji>⭐</Emoji>
            <span>{profile?.coins ?? 0}</span>
          </div>
        </div>
        
        <div className={way("max-w-2xl mx-auto mt-2 flex gap-2 pb-2")}>
          {/* Timer Progress */}
          <div className={wayTheme.PROGRESS.track}>
            <motion.div 
              className={isWarning ? wayTheme.PROGRESS.fill.amber : wayTheme.PROGRESS.fill.violet}
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          {/* Way Progress */}
          <div className={wayTheme.PROGRESS.track}>
            <motion.div 
              className={wayTheme.PROGRESS.fill.emerald}
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
              <div className={way(wayTheme.TEXT.micro, "text-center py-1 font-bold text-amber-600 animate-pulse")}>
                ⏱️ Últimos WAYs, ¡vamos a terminar!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-4 px-4 relative z-10">
        {ways.map((w, i) => (
          <div 
            key={w.id} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < currentIdx ? "bg-emerald-400 w-6 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : 
              i === currentIdx ? "bg-violet-500 w-8 shadow-[0_0_8px_rgba(139,92,246,0.6)]" : 
              "bg-slate-300/50 w-4"
            )}
          />
        ))}
      </div>

      {/* Main */}
      <main className={way("flex-1 px-4 pb-8 w-full relative z-10", wayResponsive.CONTAINERS.maxWidthTablet)} data-testid="way-player-main">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <LoadingSpinner size="md" />
              <div className={way(wayTheme.TEXT.label, 'animate-pulse')}>Cargando...</div>
            </div>
          ) : (
            <motion.div
              key={currentWay.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={way(wayTheme.GLASS.cardSolid, 'rounded-3xl overflow-hidden')}
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
