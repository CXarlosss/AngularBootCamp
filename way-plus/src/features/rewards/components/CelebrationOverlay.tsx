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
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
        }} />
        
        {type !== 'sad' && (
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' }}>
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
                style={{ position: 'absolute', fontSize: 48 }}
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
          style={{
            position: 'relative', backgroundColor: 'white', borderRadius: 48,
            padding: 48, boxShadow: '0 35px 60px -15px rgba(0,0,0,0.3)', textAlign: 'center',
            maxWidth: 384, margin: '0 16px', border: '8px solid white'
          }}
        >
          <div style={{ position: 'absolute', top: -64, left: '50%', transform: 'translateX(-50%)' }}>
            {type === 'happy' && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: 96, filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.15))', whiteSpace: 'nowrap' }}
              >
                😊🥇
              </motion.div>
            )}
            {type === 'sad' && (
              <motion.div style={{ fontSize: 96, filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.15))', whiteSpace: 'nowrap' }}>😢🚫</motion.div>
            )}
            {type === 'step-complete' && (
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: 128, filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.15))' }}
              >
                🏆
              </motion.div>
            )}
            {type === 'annex-complete' && (
              <motion.div style={{ fontSize: 128, filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.15))' }}>🌟</motion.div>
            )}
          </div>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {type === 'happy' && (
              <>
                <h2 style={{ fontSize: 48, fontWeight: 900, color: '#059669', letterSpacing: '-2px', margin: 0 }}>¡BRAVO!</h2>
                <p style={{ color: '#64748b', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>¡Eres un campeón!</p>
              </>
            )}
            
            {type === 'sad' && (
              <>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: '#f43f5e', letterSpacing: '-2px', margin: 0 }}>¡CASI!</h2>
                <p style={{ color: '#64748b', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>¡Inténtalo otra vez!</p>
              </>
            )}
            
            {type === 'step-complete' && (
              <>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', letterSpacing: '-2px', margin: 0 }}>¡NIVEL SUPERADO!</h2>
                <p style={{ color: '#64748b', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>¡Misión Cumplida!</p>
              </>
            )}

            {type === 'annex-complete' && (
              <>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed', letterSpacing: '-2px', margin: 0 }}>¡GENIAL!</h2>
                <p style={{ color: '#64748b', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Reto completado</p>
              </>
            )}
          </div>
          
          <AnimatePresence>
            {phase === 'coins' && coins > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                style={{
                  marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  backgroundColor: '#fef3c7', borderRadius: 32, padding: '16px 32px', border: '4px solid #fde68a'
                }}
              >
                <motion.span 
                  animate={{ rotateY: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ fontSize: 36 }}
                >
                  🪙
                </motion.span>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#b45309' }}>+{coins}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
