import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      try { audioService.playSFX('milestone'); } catch(e) {}
      
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto-dismiss after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-6 text-center overflow-hidden"
        >
          {/* Background Overlay - Soft Glass */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Gentle light rays behind */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 20deg, transparent 40deg, rgba(255,255,255,0.4) 60deg, transparent 80deg, rgba(255,255,255,0.4) 100deg, transparent 120deg, rgba(255,255,255,0.4) 140deg, transparent 160deg, rgba(255,255,255,0.4) 180deg, transparent 200deg, rgba(255,255,255,0.4) 220deg, transparent 240deg, rgba(255,255,255,0.4) 260deg, transparent 280deg, rgba(255,255,255,0.4) 300deg, transparent 320deg, rgba(255,255,255,0.4) 340deg, transparent 360deg)',
              maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)'
            }}
          />

          {/* Gentle Particles (max 8) */}
          {[...Array(8)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 0, x: 0 }}
               animate={{ 
                 opacity: [0, 1, 0],
                 y: -100 - Math.random() * 50,
                 x: (Math.random() - 0.5) * 100
               }}
               transition={{ duration: 2 + Math.random(), delay: Math.random() }}
               className="absolute top-1/2 left-1/2 text-3xl pointer-events-none"
             >
               ✨
             </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-10 max-w-sm w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-white/60 focus-visible:ring-4 ring-violet-400/50"
          >
            <div className="relative mb-6">
              <motion.div 
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl sm:text-8xl drop-shadow-lg"
              >
                🏆
              </motion.div>
            </div>

            <div className="flex justify-center items-center gap-1 mb-2">
               <span className="text-amber-400 text-xl">⭐</span>
               <span className="text-amber-400 text-xl">⭐</span>
               <span className="text-amber-400 text-xl">⭐</span>
               <span className="text-amber-400 text-xl">⭐</span>
               <span className="text-amber-400 text-xl">⭐</span>
            </div>

            <h2 className="text-sm font-black text-violet-600 mb-2 uppercase tracking-widest">
              ¡NUEVO LOGRO!
            </h2>
            
            <h3 className="text-3xl font-black text-slate-900 mb-6 leading-none tracking-tight">
              {title}
            </h3>

            <p className="text-base text-slate-600 font-medium mb-8 leading-relaxed max-w-[250px] mx-auto">
              {subtitle}
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-4 px-6 text-lg font-black transition-colors uppercase tracking-wide focus-visible:ring-4 ring-violet-400/50"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
