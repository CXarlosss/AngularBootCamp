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
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(30, 27, 75, 0.95)', // Deep indigo
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, textAlign: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              background: 'white', borderRadius: 40,
              padding: '48px 32px', maxWidth: 400, width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: 80, marginBottom: 24 }}>🏆</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1E1B4B', marginBottom: 12, lineHeight: 1.1 }}>
              {title}
            </h2>
            <p style={{ fontSize: 18, color: '#6366F1', fontWeight: 700, marginBottom: 32 }}>
              {subtitle}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                color: 'white', border: 'none', borderRadius: 24,
                padding: '18px 40px', fontSize: 20, fontWeight: 900,
                cursor: 'pointer', width: '100%',
                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
              }}
            >
              ¡SOY UN CAMPEÓN!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
