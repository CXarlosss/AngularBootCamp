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
    
    const timer1 = setTimeout(() => {
      setPhase('coins');
      // Count up animation
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
  }, [show, coins, onComplete]);

  if (!show) return null;

  const particles = ['🥇', '⭐', '✨', '🎉', '🌈', '💎', '🏅', '🌟'];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden"
      >
        {/* Background Overlay with Animated Gradient - More Vibrant */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md"
        >
          {!reduceMotion && (
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180, 270, 360],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.4)_0%,rgba(16,185,129,0.1)_30%,transparent_70%)]"
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 270, 180, 90, 0],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3)_0%,rgba(236,72,153,0.1)_40%,transparent_70%)]"
              />
            </div>
          )}
        </motion.div>
        
        {/* Particles Engine - Increased Density */}
        {type !== 'sad' && !reduceMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: (Math.random() * 120 - 10) + '%', 
                  y: -100,
                  rotate: 0,
                  scale: 0.1 + Math.random() * 0.8
                }}
                animate={{ 
                  y: '120vh',
                  rotate: Math.random() * 1080,
                  x: `+=${(Math.random() - 0.5) * 600}px`
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4,
                  ease: [0.23, 1, 0.32, 1],
                  delay: Math.random() * 3
                }}
                className="absolute text-3xl sm:text-4xl filter drop-shadow-md"
              >
                {particles[i % particles.length]}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Celebration Container */}
        <motion.div
          initial={reduceMotion ? { opacity: 0, y: 50 } : { scale: 0.2, rotate: -20, opacity: 0, y: 100 }}
          animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, filter: 'blur(20px)', transition: { duration: 0.3 } }}
          className="relative z-10"
        >
          {/* Light Rays Effect */}
          {!reduceMotion && type !== 'sad' && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-40"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 20deg, transparent 40deg, rgba(255,255,255,0.4) 60deg, transparent 80deg, rgba(255,255,255,0.4) 100deg, transparent 120deg, rgba(255,255,255,0.4) 140deg, transparent 160deg, rgba(255,255,255,0.4) 180deg, transparent 200deg, rgba(255,255,255,0.4) 220deg, transparent 240deg, rgba(255,255,255,0.4) 260deg, transparent 280deg, rgba(255,255,255,0.4) 300deg, transparent 320deg, rgba(255,255,255,0.4) 340deg, transparent 360deg)',
                maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)'
              }}
            />
          )}

          {/* Main Card - Glassmorphism Upgrade */}
          <div 
            className="bg-white/90 backdrop-blur-2xl rounded-[4rem] p-10 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] text-center max-w-xs sm:max-w-sm border-[12px] border-white/50 relative overflow-hidden"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />

            {/* Avatar / Trophy Circle */}
            <div className="relative mb-12">
              <motion.div
                animate={reduceMotion ? {} : { rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-500 rounded-full blur-3xl opacity-30 scale-150"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center text-7xl shadow-2xl border-4 border-amber-100/50"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 opacity-50" />
                <span className="relative z-10 filter drop-shadow-lg">
                  {type === 'happy' && '🏆'}
                  {type === 'sad' && '😢'}
                  {type === 'step-complete' && '👑'}
                  {type === 'annex-complete' && '🧩'}
                </span>
              </motion.div>
            </div>

            {/* Content */}
            <div className="space-y-6 relative z-10">
              {type === 'happy' && (
                <>
                  <div className="space-y-2">
                    <motion.h2 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.4, repeat: 1, repeatDelay: 1 }}
                      className="text-6xl font-black tracking-tighter leading-none"
                      style={{ 
                        background: 'linear-gradient(to bottom, #F59E0B, #D97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 0 #92400E)'
                      }}
                    >
                      ¡BRAVO!
                    </motion.h2>
                    <p className="text-xl font-black text-slate-700 tracking-tight">{labelCampeon.toUpperCase()}</p>
                  </div>
                  
                  <div className="bg-indigo-600 rounded-[2.5rem] py-3 px-6 shadow-lg shadow-indigo-200">
                    <p className="text-white font-black text-xs uppercase tracking-widest leading-none">Super Atleta WAY+</p>
                  </div>
                </>
              )}
              
              {type === 'sad' && (
                <>
                  <h2 className="text-5xl font-black text-rose-500 tracking-tighter">¡CASI!</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">¡Inténtalo otra vez!</p>
                </>
              )}
              
              {type === 'step-complete' && (
                <>
                  <h2 className="text-5xl font-black text-amber-500 tracking-tighter">¡INCREÍBLE!</h2>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Nivel Superado</p>
                </>
              )}
            </div>
            
            {/* Points / Coins Section */}
            <AnimatePresence>
              {phase === 'coins' && coins > 0 && (
                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.5, rotate: 10 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  className="mt-8 relative"
                >
                  <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 scale-110" />
                  <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] py-5 px-10 border-b-[8px] border-orange-700 shadow-2xl flex items-center justify-center gap-5">
                    <motion.div 
                      animate={reduceMotion ? {} : { rotateY: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="text-5xl drop-shadow-lg"
                    >
                      🪙
                    </motion.div>
                    <div className="text-left">
                      <div className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">Medallas</div>
                      <div className="text-5xl font-black text-white tabular-nums leading-none">+{displayCoins}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exterior Glow Decor */}
          <div className="absolute -inset-10 bg-white/5 blur-3xl -z-10 rounded-full" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


