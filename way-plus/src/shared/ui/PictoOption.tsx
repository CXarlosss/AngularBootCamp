import React from 'react';
import { motion } from 'framer-motion';
import type { Option } from '@/core/engine/types';
import { cn } from '@/shared/lib/utils';

interface Props {
  option: Option;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

export const PictoOption: React.FC<Props> = ({ option, onSelect, disabled, className }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      disabled={disabled}
      style={{
        position: 'relative',
        minHeight: 120,
        width: '100%',
        borderRadius: 32,
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        border: '4px solid #f1f5f9',
        transition: 'all 0.3s',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        // Using a basic fallback for hover state simulation (the framer-motion does the heavy lifting)
      }}
      aria-label={option.label}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '16px 24px', gap: 24 }}>
        <div style={{
          width: 80, height: 80, flexShrink: 0, backgroundColor: '#f8fafc',
          borderRadius: 16, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <img 
            src={option.image} 
            alt={option.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ 
            fontSize: 24, fontWeight: 900, color: '#1e293b', 
            letterSpacing: '-0.5px', lineHeight: 1.2, textTransform: 'uppercase' 
          }}>
            {option.label}
          </span>
        </div>
      </div>
      
      {/* Decorative inner shadow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        pointerEvents: 'none', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.01)'
      }} />
    </motion.button>
  );
};

