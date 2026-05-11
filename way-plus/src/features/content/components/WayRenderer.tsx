import React, { useState } from 'react';
import type { Way } from '@/core/engine/types';
import { PictoOption } from '@/shared/ui/PictoOption';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { adaptiveEngine, type DifficultyAdjustment } from '@/core/engine/adaptiveDifficulty';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/core/utils/audioService';

// Import Strategies
import { SequencingWay } from '../strategies/SequencingWay';
import { MemoryWay } from '../strategies/MemoryWay';
import { TracingWay } from '../strategies/TracingWay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { useConfigStore } from '@/core/stores/configStore';
import { useWayImage, getWayPlaceholder } from '@/core/services/wayImageService';
import { cn } from '@/shared/lib/utils';

interface Props {
  way: Way;
  onComplete: (summary: { duration_seconds: number; attempts: number; completed: boolean }) => void;
  activeBoostId?: string | null;
}

export const WayRenderer: React.FC<Props> = ({ way, onComplete, activeBoostId }) => {
  // Debug logs removed for production performance

  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  }>({ show: false, type: 'happy' });
  
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [adaptive, setAdaptive] = useState<DifficultyAdjustment | null>(null);
  const [extraLifeUsed, setExtraLifeUsed] = useState(false);

  const completeWay = usePlayerStore((s) => s.completeWay);
  const celebrateCompletion = useRewardsStore((s) => s.celebrateCompletion);
  const [showVideo, setShowVideo] = useState(false);

  React.useEffect(() => {
    const adjustment = adaptiveEngine.analyze(way.id);
    setAdaptive(adjustment);
  }, [way.id]);

  const { reduceMotion } = useConfigStore((s) => s.accessibility);
  const { src: situationImg, loaded: imgLoaded } = useWayImage(way.stepNumber || 1, way.wayNumber || 1);

  const handleDoubleChoiceSelect = (optionId: string) => {
    const option = way.options.find(o => o.id === optionId);
    if (!option) return;

    setAttempts(prev => prev + 1);
    
    if (option.isCorrect) {
      adaptiveEngine.addAttempt({
        wayId: way.id,
        timestamp: Date.now(),
        attemptsNeeded: attempts + 1,
        timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
        helpUsed: !!adaptive?.modifications.showHint
      });

      completeWay(way.id, attempts + 1);
      
      celebrateCompletion('way');
      setCelebration({ show: true, type: 'happy' });
      
      const delay = reduceMotion ? 2000 : 3500;
      setTimeout(() => {
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
      
      setCelebration({ show: true, type: 'sad' });
      setTimeout(() => setCelebration({ show: false, type: 'happy' }), 2000);
    }
  };

  // Switch between strategies
  const renderStrategy = () => {
    switch (way.type) {
      case 'sequencing':
        return <SequencingWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'memory':
        return <MemoryWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'tracing':
        return <TracingWay way={way as any} onComplete={() => onComplete({ duration_seconds: 0, attempts: 1, completed: true })} />;
      case 'double-choice':
      default:
        return (
          <div className="w-full max-w-2xl mx-auto px-4 pb-12 flex flex-col items-center gap-4 sm:gap-8 relative z-10">
            {/* Situational Scene Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full relative group"
            >
              <div className="relative aspect-[16/10] w-full rounded-3xl sm:rounded-[3rem] overflow-hidden bg-slate-100 border-4 sm:border-[12px] border-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
                {/* Image Layer */}
                <motion.img 
                  src={situationImg} 
                  alt="Situación" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ opacity: imgLoaded ? 1 : 0 }}
                />
                
                {/* Fallback/Loader */}
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="text-5xl"
                    >
                      🎨
                    </motion.div>
                  </div>
                )}

                {/* Decorative Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contexto Real</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Element - Stimulus */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white flex items-center gap-3 sm:gap-6"
              >
                {way.stimulus.image && (
                  <div className="w-12 h-12 sm:w-20 sm:h-20 bg-indigo-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center shrink-0 shadow-inner">
                    <img src={way.stimulus.image} alt="Ref" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-base sm:text-2xl font-black text-slate-800 leading-tight tracking-tight">
                    {way.stimulus.text}
                  </h2>
                  <div className="h-1 w-8 sm:h-1.5 sm:w-12 bg-indigo-500 rounded-full mt-1 sm:mt-2" />
                </div>
              </motion.div>
            </motion.div>

            {/* Spacer for the floating stimulus */}
            <div className="h-4" />

            {/* Options Section */}
            <div className="w-full grid grid-cols-1 gap-5 mt-4">
              <div className="flex items-center justify-center gap-3 mb-2 opacity-50">
                <div className="h-px w-full bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Toca la opción correcta</span>
                <div className="h-px w-full bg-slate-200" />
              </div>

              {way.options.map((option, idx) => (
                <motion.div 
                  key={option.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  className="relative group"
                >
                  <PictoOption
                    option={option}
                    onSelect={() => handleDoubleChoiceSelect(option.id)}
                    disabled={celebration.show}
                    className={cn(
                      "hover:ring-4 hover:ring-indigo-100 transition-all",
                      celebration.show && celebration.type === 'happy' && option.isCorrect && "ring-8 ring-emerald-400 scale-[1.03] z-20 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)]"
                    )}
                  />
                  {/* Option Badge */}
                  <div className="absolute top-4 left-4 bg-slate-100/50 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-slate-400 border border-white pointer-events-none group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Next Button Overlay */}
            <AnimatePresence>
              {celebration.show && celebration.type === 'happy' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                >
                  <button
                    onClick={() => onComplete({
                      duration_seconds: Math.floor((Date.now() - startTime) / 1000),
                      attempts: attempts + 1,
                      completed: true
                    })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-[0_20px_50px_rgba(79,70,229,0.5)] flex items-center gap-3 active:scale-95 transition-all"
                  >
                    CONTINUAR ➔
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

    }
  };


  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[85vh] overflow-hidden" style={{
      background: 'radial-gradient(circle at 50% -20%, #F8FAFF 0%, #EEF2FF 100%)'
    }}>
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(79,70,229,0.03) 0%, transparent 70%)', borderRadius: '50%' }}
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)', borderRadius: '50%' }}
        />
      </div>

      <CelebrationOverlay 
        show={celebration.show} 
        type={celebration.type} 
        coins={celebration.type === 'happy' ? 10 : 0}
      />

      <AnimatePresence>
        {adaptive?.modifications.showHint && (
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

      {renderStrategy()}

      {/* Modeling Video Overlay */}
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
                ×
              </button>
              <video 
                src={way.modelingVideoUrl} 
                controls 
                autoPlay 
                style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
              />
              <div style={{ textAlign: 'center', color: '#fff', marginTop: 16, fontWeight: 700 }}>
                ¡Mira cómo se hace! 🌟
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
