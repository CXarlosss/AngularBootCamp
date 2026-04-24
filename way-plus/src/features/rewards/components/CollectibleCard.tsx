import React from 'react';
import { motion } from 'framer-motion';
import type { Sticker } from '../data/collections';

interface Props {
  sticker: Sticker;
  isLocked?: boolean;
  isShiny?: boolean;
  count?: number;
  onClick?: () => void;
}

export const CollectibleCard: React.FC<Props> = ({ 
  sticker, 
  isLocked = false, 
  isShiny = false,
  count = 0,
  onClick 
}) => {
  const getRarityColors = () => {
    switch (sticker.rarity) {
      case 'common':    return { primary: '#94A3B8', bg: '#F8FAFC', glow: 'transparent' };
      case 'rare':      return { primary: '#3B82F6', bg: '#EFF6FF', glow: '#3B82F633' };
      case 'epic':      return { primary: '#8B5CF6', bg: '#F5F3FF', glow: '#8B5CF633' };
      case 'legendary': return { primary: '#F59E0B', bg: '#FFFBEB', glow: '#F59E0B44' };
      default:          return { primary: '#4F46E5', bg: '#F8FAFF', glow: 'transparent' };
    }
  };

  const colors = getRarityColors();

  return (
    <motion.div
      whileHover={isLocked ? {} : { scale: 1.05, rotateY: 5, rotateX: -5 }}
      onClick={onClick}
      style={{
        width: '100%',
        aspectRatio: '2.5/3.5',
        borderRadius: 24,
        background: isLocked ? '#E2E8F0' : (isShiny ? 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)' : colors.bg),
        border: `3px solid ${isLocked ? '#CBD5E1' : (isShiny ? 'transparent' : colors.primary)}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 12,
        boxShadow: isLocked ? 'none' : `0 10px 25px -5px ${isShiny ? '#4F46E544' : colors.glow}`,
        cursor: isLocked ? 'default' : 'pointer',
        perspective: 1000
      }}
    >
      {/* Shiny Border Effect */}
      {isShiny && !isLocked && (
        <motion.div
          animate={{
            background: [
              'linear-gradient(0deg, #4f46e5, #ec4899, #f59e0b, #10b981, #4f46e5)',
              'linear-gradient(360deg, #4f46e5, #ec4899, #f59e0b, #10b981, #4f46e5)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            padding: 3,
            borderRadius: 24,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Holographic Shine Sweep */}
      {(isShiny || sticker.rarity === 'legendary') && !isLocked && (
        <motion.div
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '50%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            transform: 'skewX(-25deg)',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Card Content */}
      <div style={{
        fontSize: 54,
        margin: '16px 0',
        filter: isLocked ? 'grayscale(1) opacity(0.2)' : (isShiny ? 'drop-shadow(0 0 10px rgba(79,70,229,0.4))' : 'none'),
        zIndex: 2,
        transform: isShiny ? 'scale(1.1)' : 'none'
      }}>
        {sticker.icon}
      </div>

      <div style={{ textAlign: 'center', zIndex: 2, filter: isLocked ? 'opacity(0.3)' : 'none' }}>
        <div style={{
          fontSize: 10,
          fontWeight: 900,
          color: isShiny ? '#4F46E5' : colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 4
        }}>
          {isShiny ? '✨ BRILLANTE ✨' : sticker.rarity}
        </div>
        <div style={{
          fontSize: 14,
          fontWeight: 900,
          color: '#1E1B4B',
          lineHeight: 1.1,
          maxWidth: 90
        }}>
          {sticker.name}
        </div>
      </div>

      {count > 1 && !isLocked && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: '#1E1B4B',
          color: 'white',
          fontSize: 10,
          fontWeight: 900,
          padding: '2px 6px',
          borderRadius: 8,
          zIndex: 10
        }}>
          x{count}
        </div>
      )}

      {isLocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          opacity: 0.1
        }}>
          🔒
        </div>
      )}
    </motion.div>
  );
};
