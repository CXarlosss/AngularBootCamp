import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';

export const AvatarPreview: React.FC = () => {
  const { previewAvatar, currentAvatar } = useRewardsStore();
  
  const avatar = previewAvatar;
  const isPreviewDifferent = JSON.stringify(previewAvatar) !== JSON.stringify(currentAvatar);

  const getBackgroundColor = () => {
    switch (avatar.background) {
      case 'background-space': return '#0F172A'; // slate-900
      case 'background-garden': return '#ECFDF5'; // emerald-50
      case 'background-castle': return '#FFFBEB'; // amber-50
      case 'background-clouds': return '#F0F9FF'; // sky-50
      default: return '#F1F5F9'; // slate-100
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 384, margin: '0 auto' }}>
      <div style={{ 
        aspectRatio: '1/1', borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 96, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)', 
        border: '4px solid white', background: getBackgroundColor(), transition: 'background 0.5s ease'
      }}>
        
        {/* Background Decor */}
        {avatar.background === 'background-space' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span 
                key={i} 
                style={{ position: 'absolute', fontSize: 20, opacity: 0.4 }}
                initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2 + i, repeat: Infinity }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        )}

        {avatar.background === 'background-garden' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
             {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ position: 'absolute', fontSize: 24, left: `${Math.random() * 80 + 10}%`, bottom: `${Math.random() * 20}%` }}>🌸</span>
             ))}
          </div>
        )}

        {avatar.background === 'background-castle' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyItems: 'center', opacity: 0.2 }}>
              <span style={{ fontSize: 200, position: 'absolute', top: -20, right: -40 }}>🏰</span>
          </div>
        )}
        
        {/* Composite Avatar */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Hat */}
          <div style={{ height: 64, position: 'relative', zIndex: 20 }}>
            <AnimatePresence>
              {avatar.hat !== 'hat-none' && (
                <motion.div 
                  key={avatar.hat}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  style={{ fontSize: 72, position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
                >
                  {avatar.hat === 'hat-crown' && '👑'}
                  {avatar.hat === 'hat-cap' && '🧢'}
                  {avatar.hat === 'hat-bow' && '🎀'}
                  {avatar.hat === 'hat-wizard' && '🧙'}
                  {avatar.hat === 'hat-party' && '🥳'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ position: 'relative' }}>
             {/* Cape (Behind) */}
             <div style={{ position: 'absolute', zIndex: -10, top: 16, left: '50%', transform: 'translateX(-50%)', fontSize: 128, opacity: 0.8, filter: 'blur(1px)' }}>
              {avatar.cape === 'cape-super' && '🦸'}
              {avatar.cape === 'cape-magic' && '✨'}
              {avatar.cape === 'cape-rainbow' && '🌈'}
            </div>

            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ fontSize: 160, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
            >
              {avatar.base === 'base-unicorn' && '🦄'}
              {avatar.base === 'base-dragon' && '🐉'}
              {avatar.base === 'base-puppy' && '🐶'}
              {avatar.base === 'base-kitten' && '🐱'}
            </motion.div>

            {/* Shoes */}
            <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 64, display: 'flex', gap: 4 }}>
              {avatar.shoes === 'shoes-gold' && '👟'}
              {avatar.shoes === 'shoes-rainbow' && '🌈'}
              {avatar.shoes === 'shoes-rocket' && '🚀'}
              {avatar.shoes === 'shoes-normal' && '👟'}
            </div>
          </div>
        </div>
      </div>
      
      {isPreviewDifferent && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}
        >
          <span style={{ 
            background: '#FBBF24', color: 'white', padding: '8px 24px', borderRadius: 9999, 
            fontWeight: 900, fontSize: 14, boxShadow: '0 4px 12px rgba(251,191,36,0.3)', 
            border: '2px solid white', textTransform: 'uppercase', letterSpacing: 2 
          }}>
            Vista Previa
          </span>
        </motion.div>
      )}
    </div>
  );
};
