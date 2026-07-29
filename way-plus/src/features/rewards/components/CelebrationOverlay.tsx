import React, { useEffect, useState } from 'react';
import { audioService } from '@/core/utils/audioService';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfigStore } from '@/core/stores/configStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { T, Emoji } from '@/shared/components/TypographyScale';
import { hapticService } from '@/core/services/hapticService';

interface CelebrationOverlayProps {
  show: boolean;
  type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  coins?: number;
  onComplete?: () => void;
}

const PARTICLE_EMOJIS = ['⭐', '✨', '🎉'];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ 
  show, type, coins = 0, onComplete 
}) => {
  const [phase, setPhase] = useState<'enter' | 'coins' | 'exit'>('enter');
  const [displayCoins, setDisplayCoins] = useState(0);
  const { reduceMotion } = useConfigStore((s) => s.accessibility);
  const profile = usePlayerStore(s => s.profile);
  const isFemale = profile?.gender === 'female';
  const labelCampeon = isFemale ? '¡Eres una campeona!' : '¡Eres un campeón!';
  
  useEffect(() => {
    if (!show) {
      setPhase('enter');
      setDisplayCoins(0);
      return;
    }
    
    if (type !== 'sad') {
      audioService.playSFX('success');
      hapticService.celebration();
    }
    
    const timer1 = setTimeout(() => {
      setPhase('coins');
      if (coins > 0) {
        let current = 0;
        const interval = setInterval(() => {
          current += Math.ceil(coins / 10);
          if (current >= coins) {
            setDisplayCoins(coins);
            clearInterval(interval);
          } else {
            setDisplayCoins(current);
          }
        }, 50);
      }
    }, 800);
    
    const timer2 = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => onComplete?.(), 500);
    }, 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [show, coins, onComplete, type]);

  if (!show) return null;

  const getEmoji = () => {
    switch (type) {
      case 'happy': return '🏆';
      case 'sad': return '😢';
      case 'step-complete': return '👑';
      case 'annex-complete': return '🧩';
      default: return '⭐';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'happy': return '¡Bravo!';
      case 'sad': return '¡Casi!';
      case 'step-complete': return '¡Increíble!';
      case 'annex-complete': return '¡Completado!';
      default: return '¡Bien!';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'happy': return labelCampeon;
      case 'sad': return 'Inténtalo de nuevo';
      case 'step-complete': return 'Nivel superado';
      case 'annex-complete': return 'Anexo completado';
      default: return '';
    }
  };

  const titleColor = type === 'sad' ? 'text-rose-500' : 'text-amber-600';
  const badgeColor = type === 'sad' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50 border-amber-200 text-amber-600';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/20"
        data-testid="celebration-overlay"
      >
        {/* Partículas suaves */}
        {!reduceMotion && type !== 'sad' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const tx = Math.cos(angle) * 80;
              const ty = Math.sin(angle) * 80 - 40;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0.5, 1, 0.5],
                    x: tx,
                    y: ty
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 top-1/2"
                >
                  <Emoji>{PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length]}</Emoji>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Card */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-[280px] sm:w-[320px] text-center"
          style={{ fontFamily: 'Verdana, sans-serif' }}
        >
          {/* Emoji */}
          <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-3">
            <Emoji className="text-2xl">{getEmoji()}</Emoji>
          </div>

          {/* Título */}
          <T size="base" bold className={`mb-1 ${titleColor}`} data-testid="celebration-title">
            {getTitle()}
          </T>

          {/* Subtítulo */}
          <T size="sm" bold>{getSubtitle()}</T>

          {/* Badge */}
          {type !== 'sad' && (
            <div className={`inline-block mt-2 px-3 py-1 rounded-full border ${badgeColor}`}>
              <T size="micro" bold>Super atleta WAY+</T>
            </div>
          )}

          {/* Monedas */}
          <AnimatePresence>
            {phase === 'coins' && coins > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <Emoji>🪙</Emoji>
                <div className="text-left">
                  <T size="micro" bold color="warning">Medallas</T>
                  <T size="lg" bold data-testid="celebration-coins">+{displayCoins}</T>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
