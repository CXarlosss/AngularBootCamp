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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full min-h-[140px] rounded-[32px] bg-white shadow-xl border-4 border-slate-100 transition-all cursor-pointer flex flex-col items-center justify-center p-4 gap-3 text-center",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {/* Pictogram Container */}
      <div className="w-20 h-20 flex-shrink-0 bg-slate-50 rounded-2xl p-3 flex items-center justify-center shadow-inner border border-slate-100/50 overflow-hidden">
        {option.image ? (
          <img 
            src={option.image} 
            alt={option.label}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as any).parentElement.innerHTML = '<span class="text-3xl">🎯</span>';
            }}
          />
        ) : (
          <span className="text-3xl">🎯</span>
        )}
      </div>
      
      {/* Label */}
      <div className="w-full px-1">
        <span 
          className="text-lg font-black uppercase tracking-tight leading-tight block"
          style={{ color: '#1E293B' }}
        >
          {option.label || `Opción ${option.id.slice(0,4)}`}
        </span>
      </div>
      
      <div className="absolute inset-0 pointer-events-none rounded-[32px] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" />
    </motion.button>
  );
};
