import React, { useState } from 'react';
import type { Way } from '@/core/engine/types';
import { PictoOption } from '@/shared/ui/PictoOption';
const CelebrationOverlay = React.lazy(() => import('@/features/rewards/components/CelebrationOverlay').then(m => ({ default: m.CelebrationOverlay })));
import { adaptiveEngine, type DifficultyAdjustment } from '@/core/engine/adaptiveDifficulty';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/core/utils/audioService';

// Import Strategies
import { SequencingWay } from '../strategies/SequencingWay';
import { MemoryWay } from '../strategies/MemoryWay';
import { TracingWay } from '../strategies/TracingWay';
import { RoleplayWay } from '../strategies/RoleplayWay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { useConfigStore } from '@/core/stores/configStore';
import { useWayImage } from '@/core/services/wayImageService';
import { cn } from '@/shared/lib/utils';

interface Props {
  way: Way;
  onComplete: (summary: { duration_seconds: number; attempts: number; completed: boolean }) => void;
  activeBoostId?: string | null;
}

export const WayRenderer: React.FC<Props> = ({ way, onComplete, activeBoostId }) => {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  }>({ show: false, type: 'happy' });
  
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [adaptive, setAdaptive] = useState<DifficultyAdjustment | null>(null);
  const [extraLifeUsed, setExtraLifeUsed] = useState(false);
  const [attemptState, setAttemptState] = useState<'idle' | 'error' | 'retry'>('idle');
  const [highlightedChoice, setHighlightedChoice] = useState<string | null>(null);

  const completeWay = usePlayerStore((s) => s.completeWay);
  const celebrateCompletion = useRewardsStore((s) => s.celebrateCompletion);
  const [showVideo, setShowVideo] = useState(false);

  React.useEffect(() => {
    const adjustment = adaptiveEngine.analyze(way.id);
    setAdaptive(adjustment);
  }, [way.id]);

  const { reduceMotion } = useConfigStore((s) => s.accessibility);
  const { src: situationImg, loaded: imgLoaded, hasError } = useWayImage(
    way.stepNumber || 1, 
    way.wayNumber || 1,
    way.theme || 'default'
  );

  const handleDoubleChoiceSelect = (optionId: string) => {
    if (attemptState === 'error') return;

    const option = way.options.find(o => o.id === optionId);
    if (!option) return;

    audioService.stopSpeak();
    setAttempts(prev => prev + 1);
    
    if (option.isCorrect) {
      setAttemptState('idle');
      audioService.playSFX('success');
      adaptiveEngine.addAttempt({
        wayId: way.id,
        timestamp: Date.now(),
        attemptsNeeded: attempts + 1,
        timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
        helpUsed: !!adaptive?.modifications.showHint
      });

      completeWay(way.id, attempts + 1);
      
      setCelebration({ show: true, type: 'happy' });
      
      const delay = reduceMotion ? 1500 : 2500;
      setTimeout(() => {
        celebrateCompletion('way');
        onComplete({
          duration_seconds: Math.floor((Date.now() - startTime) / 1000),
          attempts: attempts + 1,
          completed: true
        });
      }, delay); 
    } else {
      if (activeBoostId === 'extra_life' && !extraLifeUsed) {
        setExtraLifeUsed(true);
        audioService.playSFX('success');
        return;
      }
      
      setAttemptState('error');
      audioService.playSFX('error');
      setCelebration({ show: true, type: 'sad' });
      
      const correctOptionId = way.options.find(o => o.isCorrect)?.id;
      if (correctOptionId) {
        setHighlightedChoice(correctOptionId);
      }
      
      setTimeout(() => {
        setAttemptState('retry');
        setHighlightedChoice(null);
        setCelebration({ show: false, type: 'happy' });
        audioService.stopSpeak();
        audioService.speak(way.stimulus.text);
      }, 1500);
    }
  };

  const renderStrategy = () => {
    switch (way.type) {
      case 'sequencing':
        return <SequencingWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'memory':
        return <MemoryWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'tracing':
        return <TracingWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'roleplay':
        return <RoleplayWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'double-choice':
      default:
        return (
          <div className="w-full flex flex-col items-center px-4 bg-transparent max-w-4xl mx-auto h-full relative z-10">
            <div className="w-full h-[50vh] sm:h-[55vh] bg-slate-200 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-md relative border-[6px] border-white shrink-0 mt-2">
              <AnimatePresence mode="wait">
                {imgLoaded ? (
                  <motion.img 
                    key="real-image"
                    src={situationImg} 
                    alt="Situación" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-200 animate-pulse"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="w-full text-center mt-6 shrink-0 flex flex-col items-center">
              <h2 data-testid="way-question" className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 leading-tight tracking-tight px-4 line-clamp-2 max-w-3xl mx-auto" style={{ fontFamily: 'Verdana, sans-serif' }}>
                {way.stimulus.text}
              </h2>
            </div>

            <div className="w-full flex justify-center gap-6 sm:gap-8 mt-6 shrink-0 pb-6">
              {way.options.map((option, idx) => {
                const isSelected = celebration.show && celebration.type === 'happy' && option.isCorrect;
                const isWrong = celebration.show && celebration.type === 'sad' && !option.isCorrect;
                const isHighlighted = highlightedChoice === option.id;

                return (
                  <motion.button 
                    key={option.id}
                    data-testid="choice-option"
                    data-choice-id={option.id}
                    disabled={celebration.show || attemptState === 'error'}
                    onClick={() => handleDoubleChoiceSelect(option.id)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-[45%] h-[140px] sm:h-[180px] bg-white rounded-[2rem] border-b-[8px] sm:border-b-[12px] border-slate-200 shadow-sm flex flex-col items-center justify-center p-4 transition-all relative overflow-hidden duration-300",
                      isSelected && "border-emerald-500 bg-emerald-50 border-b-0 translate-y-[8px] sm:translate-y-[12px]",
                      isWrong && "border-rose-500 bg-rose-50 border-b-0 translate-y-[8px] sm:translate-y-[12px]",
                      isHighlighted && "bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] duration-700",
                      !celebration.show && attemptState !== 'error' && "hover:bg-slate-50 hover:border-slate-300 active:border-b-0 active:translate-y-[8px] sm:active:translate-y-[12px]"
                    )}
                  >
                    {option.image ? (
                      <img src={option.image} className="w-16 h-16 sm:w-28 sm:h-28 object-contain drop-shadow-md z-10" alt={option.label} />
                    ) : (
                      <span className="text-4xl sm:text-5xl lg:text-6xl z-10">🎯</span>
                    )}
                    
                    <span className="mt-2 font-black text-slate-700 text-base sm:text-lg lg:text-xl uppercase tracking-tight z-10">
                      {option.label}
                    </span>

                    {isSelected && <motion.div initial={{opacity: 0}} animate={{opacity: [0, 0.4, 0]}} transition={{duration: 0.5}} className="absolute inset-0 bg-emerald-400 z-0 mix-blend-overlay pointer-events-none" />}
                    {isWrong && <motion.div initial={{opacity: 0}} animate={{opacity: [0, 0.4, 0]}} transition={{duration: 0.5}} className="absolute inset-0 bg-rose-400 z-0 mix-blend-overlay pointer-events-none" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("relative w-full flex flex-col items-center justify-start min-h-[calc(100vh-80px)] transition-colors duration-500", attemptState === 'error' && "bg-rose-50")} style={{ fontFamily: 'Verdana, sans-serif' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={way.id}
          data-testid="way-renderer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full h-full"
        >
          {renderStrategy()}
        </motion.div>
      </AnimatePresence>

      <React.Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]"><div className="w-32 h-32 rounded-full bg-yellow-400 animate-pulse" /></div>}>
        <CelebrationOverlay 
          show={celebration.show} 
          type={celebration.type} 
          coins={celebration.type === 'happy' ? 10 : 0}
        />
      </React.Suspense>

      <AnimatePresence>
        {attemptState === 'error' && (
          <motion.div 
            data-testid="error-feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-10 bg-white text-rose-600 px-8 py-4 rounded-full font-black text-2xl border-4 border-rose-100 shadow-xl flex items-center gap-4 z-40"
          >
            <span className="text-4xl">🚫</span> Inténtalo de nuevo
          </motion.div>
        )}
        
        {adaptive?.modifications.showHint && attemptState !== 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 bg-amber-50 text-amber-800 px-6 py-4 rounded-3xl font-black text-sm border-2 border-amber-100 shadow-xl flex items-center gap-4 z-30"
          >
            <div className="bg-amber-400 w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-inner">💡</div>
            <span>CONSEJO: Mira bien el dibujo. ¿Qué niño se siente mejor?</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {way.modelingVideoUrl && (
          <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 40 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowVideo(true)}
              style={{
                background: '#fff', border: '2px solid #4F46E5', borderRadius: '50%',
                width: 56, height: 56, fontSize: 24, cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(79,70,229,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              🎥
            </motion.button>
          </div>
        )}

        {showVideo && way.modelingVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.9)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 20
            }}
          >
            <div style={{ width: '100%', maxWidth: 640, position: 'relative' }}>
              <button 
                onClick={() => setShowVideo(false)}
                style={{
                  position: 'absolute', top: -40, right: 0,
                  background: 'transparent', border: 'none', color: '#fff',
                  fontSize: 32, cursor: 'pointer'
                }}
              >
                ✕
              </button>
              <video 
                src={way.modelingVideoUrl} 
                controls 
                autoPlay 
                style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
              />
              <div style={{ textAlign: 'center', color: '#fff', marginTop: 16, fontWeight: 700 }}>
                ¡Mira cómo se hace! 👀
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
