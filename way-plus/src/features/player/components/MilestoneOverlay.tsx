import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { audioService } from '@/core/utils/audioService';

interface MilestoneOverlayProps {
  show: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
}

export const MilestoneOverlay: React.FC<MilestoneOverlayProps> = ({
  show, title, subtitle, onClose
}) => {
  useEffect(() => {
    if (show) {
      audioService.playSFX('milestone');
      
      // Lanzar confeti!
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-6 text-center overflow-hidden"
        >
          {/* Background Overlay - Aurora Glass */}
          <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.3)_0%,transparent_70%)]"
          />

          {/* Light Rays Effect */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 20deg, transparent 40deg, rgba(255,255,255,0.4) 60deg, transparent 80deg, rgba(255,255,255,0.4) 100deg, transparent 120deg, rgba(255,255,255,0.4) 140deg, transparent 160deg, rgba(255,255,255,0.4) 180deg, transparent 200deg, rgba(255,255,255,0.4) 220deg, transparent 240deg, rgba(255,255,255,0.4) 260deg, transparent 280deg, rgba(255,255,255,0.4) 300deg, transparent 320deg, rgba(255,255,255,0.4) 340deg, transparent 360deg)',
              maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)'
            }}
          />

          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[4rem] p-10 max-w-sm w-full shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] border-[12px] border-white/50"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl filter drop-shadow-2xl"
              >
                🏆
              </motion.div>
            </div>

            <h2 className="text-4xl font-black text-slate-800 mb-4 leading-none tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-xl text-indigo-500 font-bold mb-10 leading-tight">
              {subtitle}
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={onClose}
              className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2.5rem] py-5 px-8 text-xl font-black shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] border-b-[6px] border-indigo-900 active:border-b-0 transition-all uppercase tracking-widest"
            >
              ¡SOY UN CAMPEÓN!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
