import React, { useState } from 'react';
import type { Way } from '@/core/engine/types';
import { PictoOption } from '@/shared/ui/PictoOption';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { adaptiveEngine, type DifficultyAdjustment } from '@/core/engine/adaptiveDifficulty';
import { motion, AnimatePresence } from 'framer-motion';

// Import Strategies
import { SequencingWay } from '../strategies/SequencingWay';
import { MemoryWay } from '../strategies/MemoryWay';
import { TracingWay } from '../strategies/TracingWay';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';

interface Props {
  way: Way;
  onComplete: () => void;
}

export const WayRenderer: React.FC<Props> = ({ way, onComplete }) => {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  }>({ show: false, type: 'happy' });
  
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [adaptive, setAdaptive] = useState<DifficultyAdjustment | null>(null);

  const completeWay = usePlayerStore((s) => s.completeWay);
  const celebrateCompletion = useRewardsStore((s) => s.celebrateCompletion);

  React.useEffect(() => {
    const adjustment = adaptiveEngine.analyze(way.id);
    setAdaptive(adjustment);
  }, [way.id]);

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
      
      setTimeout(onComplete, 3500); 
    } else {
      setCelebration({ show: true, type: 'sad' });
      setTimeout(() => setCelebration({ show: false, type: 'happy' }), 2000);
    }
  };

  // Switch between strategies
  const renderStrategy = () => {
    switch (way.type) {
      case 'sequencing':
        return <SequencingWay way={way as any} onComplete={onComplete} />;
      case 'memory':
        return <MemoryWay way={way as any} onComplete={onComplete} />;
      case 'tracing':
        return <TracingWay way={way as any} onComplete={onComplete} />;
      case 'double-choice':
      default:
        return (
          <div className="flex flex-col items-center gap-10 w-full max-w-lg mx-auto py-4 px-2">
             {/* Stimulus Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center space-y-4"
            >
              <div className="mx-auto w-40 h-40 bg-white rounded-[2.5rem] shadow-xl p-6 border-4 border-slate-50 animate-float flex items-center justify-center">
                <img src={way.stimulus.image} alt="Estímulo" className="max-w-full max-h-full object-contain" />
              </div>
              {way.stimulus.text && (
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">
                  {way.stimulus.text}
                </h2>
              )}
            </motion.div>

            {/* Options Grid - Single column for mobile accessibility */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {way.options.map((option) => (
                <PictoOption
                  key={option.id}
                  option={option}
                  onSelect={() => handleDoubleChoiceSelect(option.id)}
                  disabled={celebration.show}
                  className={celebration.show && celebration.type === 'happy' && option.isCorrect ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100' : ''}
                />
              ))}
            </div>
          </div>
        );

    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[70vh]">
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
    </div>
  );
};
