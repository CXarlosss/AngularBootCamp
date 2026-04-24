import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRewardsStore } from '../store/rewardsStore';
import { STICKERS_CATALOG } from '../data/collections';
import { CollectibleCard } from './CollectibleCard';

export const CardUnlockOverlay: React.FC = () => {
  const { newCardAwarded, clearNewCardCelebration } = useRewardsStore();
  
  const sticker = React.useMemo(() => 
    newCardAwarded ? STICKERS_CATALOG.find(s => s.id === newCardAwarded.id) : null, 
    [newCardAwarded]
  );

  React.useEffect(() => {
    if (newCardAwarded) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: newCardAwarded.isShiny ? ['#4F46E5', '#ec4899', '#f59e0b', '#10b981'] : ['#4F46E5', '#8B5CF6', '#F59E0B', '#10B981']
      });
      
      if (newCardAwarded.isShiny) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.5 },
            colors: ['#FFFFFF', '#4F46E5', '#FFEECC']
          });
        }, 300);
      }
    }
  }, [newCardAwarded]);

  if (!sticker) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 12, 41, 0.95)',
          backdropFilter: 'blur(15px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.3, rotateY: -720, y: 100 }}
          animate={{ scale: 1.3, rotateY: 0, y: -20 }}
          transition={{ type: 'spring', damping: 15, stiffness: 80 }}
          style={{ width: '100%', maxWidth: 220, marginBottom: 80, filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }}
        >
          <CollectibleCard 
            sticker={sticker} 
            isShiny={newCardAwarded?.isShiny}
            count={1}
          />
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ 
            background: newCardAwarded?.isShiny 
              ? 'linear-gradient(to right, #4F46E5, #ec4899, #f59e0b)' 
              : 'linear-gradient(to right, #FDE68A, #F59E0B)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: newCardAwarded?.isShiny ? 48 : 40, 
            fontWeight: 900, 
            marginBottom: 8,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            {newCardAwarded?.isShiny ? '✨ ¡CROMO BRILLANTE! ✨' : '¡CROMO NUEVO!'}
          </div>
          
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 40, fontWeight: 600 }}>
            {newCardAwarded?.isShiny ? '¡Increíble suerte! Has ganado a:' : 'Has ganado a:'} <br/>
            <span style={{ color: '#FDE68A', fontSize: 28, fontWeight: 900 }}>{sticker.name}</span>
          </p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearNewCardCelebration}
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', 
              color: 'white', border: '4px solid white',
              padding: '18px 60px', borderRadius: 30, fontWeight: 900,
              fontSize: 20, cursor: 'pointer', 
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
            }}
          >
            {newCardAwarded?.isShiny ? '¡ÉPICO! 🌈' : '¡BRUTAL! 🚀'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
