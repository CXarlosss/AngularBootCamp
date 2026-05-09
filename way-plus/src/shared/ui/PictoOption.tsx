import React from 'react';
import { motion } from 'framer-motion';
import type { Option } from '@/core/engine/types';
import { cn } from '@/shared/lib/utils';
import { useConfigStore } from '@/core/stores/configStore';

interface Props {
  option: Option;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

export const PictoOption: React.FC<Props> = React.memo(({ option, onSelect, disabled, className }) => {
  const { reduceMotion, highAccessibility, showTextLabels } = useConfigStore((s) => s.accessibility);

  const buttonVariants = {
    tap: reduceMotion ? {} : { scale: 0.95 },
    hover: reduceMotion ? {} : { scale: 1.02, y: -2 }
  };

  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-[32px] bg-white shadow-xl border-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
        highAccessibility ? "min-h-[180px] p-8 border-slate-300" : "min-h-[140px] p-4 border-slate-100",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {/* Pictogram Container */}
      <div className={cn(
        "flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100/50 overflow-hidden",
        highAccessibility ? "w-32 h-32 p-4" : "w-20 h-20 p-3"
      )}>
        {option.image ? (
          <img 
            src={option.image} 
            alt={option.label}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as any).parentElement.innerHTML = '<span class="text-4xl">🎯</span>';
            }}
          />
        ) : (
          <span className={highAccessibility ? "text-5xl" : "text-3xl"}>🎯</span>
        )}
      </div>
      
      {/* Label */}
      {showTextLabels && (
        <div className="w-full px-1 mt-3">
          <span 
            className={cn(
              "font-black uppercase tracking-tight leading-tight block",
              highAccessibility ? "text-2xl" : "text-lg"
            )}
            style={{ color: '#1E293B' }}
          >
            {option.label || `Opción ${option.id.slice(0,4)}`}
          </span>
        </div>
      )}
      
      <div className="absolute inset-0 pointer-events-none rounded-[32px] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" />
    </motion.button>
  );
});

PictoOption.displayName = 'PictoOption';

