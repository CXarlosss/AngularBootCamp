import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  useEffect(() => {
    if (!show) {
      setPhase('enter');
      return;
    }
    
    const timer1 = setTimeout(() => setPhase('coins'), 800);
    const timer2 = setTimeout(() => {
      setPhase('exit');
      // Esperamos un poco más para que la animación de salida se vea antes de llamar a onComplete si fuera necesario
      setTimeout(() => onComplete?.(), 500);
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [show, onComplete]);

  if (!show) return null;

  const particles = ['🥇', '⭐', '✨', '🎉', '🌈', '💎'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        {type !== 'sad' && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: -50,
                  rotate: 0 
                }}
                animate={{ 
                  y: '110vh',
                  rotate: Math.random() * 720,
                  x: `+=${(Math.random() - 0.5) * 400}px`
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  ease: "linear",
                  delay: Math.random() * 1
                }}
                className="absolute text-5xl"
              >
                {particles[i % particles.length]}
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative bg-white rounded-[3rem] p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] text-center max-w-sm mx-4 border-8 border-white"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            {type === 'happy' && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-9xl filter drop-shadow-xl"
              >
                😃
              </motion.div>
            )}
            {type === 'sad' && (
              <motion.div className="text-9xl filter drop-shadow-xl">😢</motion.div>
            )}
            {type === 'step-complete' && (
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-9xl filter drop-shadow-xl"
              >
                🏆
              </motion.div>
            )}
            {type === 'annex-complete' && (
              <motion.div className="text-9xl filter drop-shadow-xl">🌟</motion.div>
            )}
          </div>

          <div className="mt-12 space-y-4">
            {type === 'happy' && (
              <>
                <h2 className="text-5xl font-black text-emerald-600 tracking-tighter">¡BRAVO!</h2>
                <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">¡Eres un campeón!</p>
              </>
            )}
            
            {type === 'sad' && (
              <>
                <h2 className="text-4xl font-black text-rose-500 tracking-tighter">¡CASI!</h2>
                <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">¡Inténtalo otra vez!</p>
              </>
            )}
            
            {type === 'step-complete' && (
              <>
                <h2 className="text-4xl font-black text-amber-500 tracking-tighter">¡NIVEL SUPERADO!</h2>
                <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">¡Misión Cumplida!</p>
              </>
            )}

            {type === 'annex-complete' && (
              <>
                <h2 className="text-4xl font-black text-violet-600 tracking-tighter">¡GENIAL!</h2>
                <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">Reto completado</p>
              </>
            )}
          </div>
          
          <AnimatePresence>
            {phase === 'coins' && coins > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="mt-8 flex items-center justify-center gap-3 bg-amber-100 rounded-[2rem] px-8 py-4 border-4 border-amber-200"
              >
                <motion.span 
                  animate={{ rotateY: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="text-4xl"
                >
                  🪙
                </motion.span>
                <span className="text-4xl font-black text-amber-700">+{coins}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
