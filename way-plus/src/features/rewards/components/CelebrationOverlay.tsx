import React, { useEffect, useState } from 'react';
import { audioService } from '@/core/utils/audioService';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfigStore } from '@/core/stores/configStore';
import { usePlayerStore } from '@/features/player/store/playerStore';

interface CelebrationOverlayProps {
  show: boolean;
  type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  coins?: number;
  onComplete?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ 
  show, type, coins = 0, onComplete 
}) => {
  const [phase, setPhase] = useState<'enter' | 'coins' | 'exit'>('enter');
  const [displayCoins, setDisplayCoins] = useState(0);
  const { reduceMotion } = useConfigStore((s) => s.accessibility);
  const profile = usePlayerStore(s => s.profile);
  const isFemale = profile.gender === 'female';
  const labelCampeon = isFemale ? '¡Eres una campeona!' : '¡Eres un campeón!';
  
  useEffect(() => {
    if (!show) {
      setPhase('enter');
      setDisplayCoins(0);
      return;
    }
    
    // Play success sound
    if (type !== 'sad') {
      audioService.playSFX('success');
    }
    
    const timer1 = setTimeout(() => {
      setPhase('coins');
      // Count up animation with slot effect timing
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

  const particles = ['🥇', '⭐', '✨', '🎉', '🌟', '💎'];

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
        
        {/* Flash de luz suave inicial */}
        {type !== 'sad' && !reduceMotion && phase === 'enter' && (
          <div className="celebration-flash" />
        )}
        
        {/* Arco iris sutil de fondo */}
        {type !== 'sad' && !reduceMotion && (
          <div className="rainbow-subtle" />
        )}

        {/* Explosión de estrellas centrales */}
        {type !== 'sad' && !reduceMotion && phase === 'enter' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="star-burst"
                style={{
                  '--sx': `${Math.cos(i * 30 * Math.PI / 180) * 300}px`,
                  '--sy': `${Math.sin(i * 30 * Math.PI / 180) * 300}px`
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Partículas con física real */}
        {type !== 'sad' && !reduceMotion && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = Math.random() * Math.PI * 2;
              const distance = 100 + Math.random() * 300;
              const tx = Math.cos(angle) * distance;
              const ty = Math.sin(angle) * distance - 200; // upward bias
              const rot = Math.random() * 720 - 360;
              return (
                <div
                  key={`particle-${i}`}
                  className="particle-physics filter drop-shadow-md"
                  style={{
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                    '--rot': `${rot}deg`,
                    animationDelay: `${Math.random() * 0.2}s`
                  } as React.CSSProperties}
                >
                  {particles[i % particles.length]}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Celebration Container */}
        <motion.div
          initial={reduceMotion ? { opacity: 0, y: 50 } : { scale: 0.2, rotate: -10, opacity: 0, y: 100 }}
          animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
          className="relative z-30"
        >
          {/* Main Card - Glassmorphism Premium */}
          <div className="celebration-card w-[320px] sm:w-[400px]" style={{ fontFamily: 'Verdana, sans-serif' }}>
            
            {/* Avatar / Trophy Circle */}
            <div className="relative mb-8 mt-4">
              {type !== 'sad' && !reduceMotion && (
                <div className="glow-gold" />
              )}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                className="relative w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center text-7xl shadow-2xl border-[6px] border-amber-100 z-10"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-amber-50/50" />
                <span className="relative z-10 filter drop-shadow-md">
                  {type === 'happy' && '🏆'}
                  {type === 'sad' && '😢'}
                  {type === 'step-complete' && '👑'}
                  {type === 'annex-complete' && '🧩'}
                </span>
              </motion.div>
            </div>

            {/* Content */}
            <div className="space-y-4 relative z-10">
              {type === 'happy' && (
                <>
                  <div className="text-impact">
                    <h2 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 drop-shadow-sm">
                      ¡BRAVO!
                    </h2>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{labelCampeon}</p>
                  
                  <div className="inline-block bg-indigo-50/80 border border-indigo-100 rounded-full py-2 px-4 shadow-sm mt-2">
                    <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">Super Atleta WAY+</p>
                  </div>
                </>
              )}
              
              {type === 'sad' && (
                <>
                  <h2 className="text-5xl font-black text-rose-500 tracking-tighter">¡CASI!</h2>
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">¡Inténtalo de nuevo!</p>
                </>
              )}
              
              {type === 'step-complete' && (
                <>
                  <div className="text-impact">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 drop-shadow-sm tracking-tighter">
                      ¡INCREÍBLE!
                    </h2>
                  </div>
                  <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Nivel Superado</p>
                </>
              )}
            </div>
            
            {/* Points / Coins Section */}
            <AnimatePresence>
              {phase === 'coins' && coins > 0 && (
                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className="mt-8 flex items-center justify-center gap-4"
                >
                  <div className="coin-3d-gold">
                    🪙
                  </div>
                  <div className="text-left flex flex-col justify-center overflow-hidden h-[70px]">
                    <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Medallas</div>
                    <div className="flex items-center text-5xl font-black text-slate-800 leading-none">
                      <span className="text-amber-500 mr-1">+</span>
                      <div className="slot-number !text-slate-800" key={displayCoins}>{displayCoins}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


