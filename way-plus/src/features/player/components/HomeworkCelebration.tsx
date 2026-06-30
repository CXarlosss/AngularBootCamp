import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/core/utils/audioService';

interface Props {
  show: boolean;
  playerName: string;
  playerAvatar: string;
  onComplete: () => void;
}

export function HomeworkCelebration({ show, playerName, playerAvatar, onComplete }: Props) {
  useEffect(() => {
    if (show) {
      audioService.playSFX('success_homework'); 
      const timer = setTimeout(onComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="celebration-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(79, 70, 229, 0.95)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', color: 'white', padding: 20
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1.2, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            style={{ fontSize: 120, marginBottom: 20 }}
          >
            {playerAvatar || '🌟'}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 10px' }}>
              ¡GRANDE, {playerName.toUpperCase()}!
            </h2>
            <p style={{ fontSize: 20, fontWeight: 700, opacity: 0.9 }}>
              Has completado tu ejercicio especial de hoy.
            </p>
          </motion.div>

          {/* Partículas de confeti */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 400, 
                y: (Math.random() - 0.5) * 400, 
                scale: [0, 1, 0],
                rotate: 360 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              style={{ position: 'absolute', fontSize: 40 }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
