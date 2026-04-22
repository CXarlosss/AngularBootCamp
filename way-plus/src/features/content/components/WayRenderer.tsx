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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: '100%', maxWidth: 512, margin: '0 auto', padding: '16px 8px' }}>
             {/* Stimulus Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ 
                margin: '0 auto', width: 160, height: 160, backgroundColor: 'white', borderRadius: 40, 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
                padding: 24, border: '4px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <img src={way.stimulus.image} alt="Estímulo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              {way.stimulus.text && (
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px', lineHeight: 1.2, textTransform: 'uppercase' }}>
                  {way.stimulus.text}
                </h2>
              )}
            </motion.div>

            {/* Options Grid - Single column for mobile accessibility */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, width: '100%' }}>
              {way.options.map((option) => (
                <div key={option.id} style={{ 
                  borderRadius: 32,
                  ...(celebration.show && celebration.type === 'happy' && option.isCorrect ? {
                    border: '4px solid #34d399', backgroundColor: '#ecfdf5', boxShadow: '0 0 0 4px #d1fae5'
                  } : {})
                }}>
                  <PictoOption
                    option={option}
                    onSelect={() => handleDoubleChoiceSelect(option.id)}
                    disabled={celebration.show}
                  />
                </div>
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
