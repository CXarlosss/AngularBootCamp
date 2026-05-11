import React from 'react';
import { motion, type Variants } from 'framer-motion';
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

  const buttonVariants: Variants = {
    tap: reduceMotion ? {} : { scale: 0.96, y: 2, transition: { type: 'spring', stiffness: 400, damping: 15 } },
    hover: reduceMotion ? {} : { 
      scale: 1.03, 
      y: -6,
      boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.2), 0 15px 30px -15px rgba(0, 0, 0, 0.3)"
    }
  };

  const iconVariants: Variants = {
    idle: { y: 0 },
    hover: { 
      y: -8,
      transition: { duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
    }
  };

  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-[2.5rem] bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center group",
        "border-b-[10px] active:border-b-0", 
        highAccessibility ? "min-h-[200px] p-8 border-slate-200" : "min-h-[160px] p-6 border-slate-200",
        "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]",
        disabled && "opacity-60 cursor-not-allowed grayscale-[0.5]",
        className
      )}
      style={{ 
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      {/* Inner Decorative Shine */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

      {/* Pictogram Container */}
      <motion.div 
        variants={iconVariants}
        animate="hover"
        className={cn(
          "flex-shrink-0 bg-gradient-to-br from-indigo-50/50 to-white rounded-[2rem] flex items-center justify-center overflow-hidden",
          "shadow-[0_10px_20px_-5px_rgba(79,70,229,0.1),inset_0_4px_12px_rgba(0,0,0,0.03)] border border-white relative",
          highAccessibility ? "w-32 h-32 p-4" : "w-24 h-24 p-3"
        )}
      >
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {option.image ? (
          <img 
            src={option.image} 
            alt={option.label}
            className="w-full h-full object-contain drop-shadow-2xl relative z-10"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as any).parentElement.innerHTML = '<span class="text-5xl">🎯</span>';
            }}
          />
        ) : (
          <span className={cn("relative z-10", highAccessibility ? "text-6xl" : "text-5xl")}>🎯</span>
        )}
      </motion.div>
      
      {/* Label */}
      {showTextLabels && (
        <div className="w-full px-2 mt-4 relative z-10">
          <span 
            className={cn(
              "font-black tracking-tight leading-tight block uppercase",
              highAccessibility ? "text-2xl" : "text-xl"
            )}
            style={{ 
              color: '#1E293B',
              textShadow: '0 1px 0 rgba(255,255,255,1)'
            }}
          >
            {option.label || `Opción ${option.id.slice(0,4)}`}
          </span>
          
          {/* Decorative bar */}
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: '40%' }}
            className="h-1 bg-indigo-400 rounded-full mx-auto mt-2 opacity-50" 
          />
        </div>
      )}
      
      {/* 3D Light Source */}
      <div className="absolute top-2 left-6 right-6 h-10 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-[4px] pointer-events-none" />
    </motion.button>

  );
});

PictoOption.displayName = 'PictoOption';

