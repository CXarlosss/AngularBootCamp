import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { SECRET_CARDS } from '../data/secrets';

export const SecretRevealOverlay: React.FC = () => {
  const { newSecretAwarded, clearSecretCelebration } = useRewardsStore();
  
  const secret = React.useMemo(() => 
    SECRET_CARDS.find(s => s.id === newSecretAwarded),
    [newSecretAwarded]
  );

  if (!secret) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: '#000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center'
        }}
      >
        {/* Mystic Aura */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '100vw',
            height: '100vw',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ 
            fontSize: 14, 
            fontWeight: 900, 
            color: '#8B5CF6', 
            letterSpacing: 4,
            marginBottom: 16,
            textTransform: 'uppercase'
          }}>
            Misterio Resuelto
          </div>
          
          <h2 style={{ 
            fontSize: 48, 
            fontWeight: 900, 
            color: 'white', 
            margin: '0 0 40px',
            textShadow: '0 0 20px rgba(139, 92, 246, 0.8)'
          }}>
            {secret.name}
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: 720 }}
          animate={{ scale: 1.5, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 12, 
            stiffness: 100,
            delay: 1
          }}
          style={{ fontSize: 120, marginBottom: 80 }}
        >
          🔮
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 40, maxWidth: 300 }}>
            Has descubierto un secreto oculto de WAY+
          </p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearSecretCelebration}
            style={{
              background: 'white', 
              color: 'black', 
              border: 'none',
              padding: '16px 48px', 
              borderRadius: 30, 
              fontWeight: 900,
              fontSize: 18, 
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(255,255,255,0.3)'
            }}
          >
            REVELAR PREMIO
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
