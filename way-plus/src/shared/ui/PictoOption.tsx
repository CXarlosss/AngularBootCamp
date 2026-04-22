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
      className={cn(
        "relative min-h-[120px] w-full rounded-[2rem] bg-white shadow-xl overflow-hidden",
        "border-4 border-slate-100 transition-all duration-300",
        "hover:border-primary-400 focus:outline-none focus:ring-8 focus:ring-primary-100",
        "disabled:opacity-70 disabled:cursor-not-allowed group",
        className
      )}
      aria-label={option.label}
    >
      <div className="flex items-center h-full px-6 py-4 gap-6">
        <div className="w-20 h-20 flex-shrink-0 bg-slate-50 rounded-2xl p-2 flex items-center justify-center">
          <img 
            src={option.image} 
            alt={option.label}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 text-left">
          <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">
            {option.label}
          </span>
        </div>
      </div>
      
      {/* Decorative inner shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.01)]" />
    </motion.button>
  );
};

