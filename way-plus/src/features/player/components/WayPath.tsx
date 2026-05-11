import React from 'react';
import { motion } from 'framer-motion';

interface WayPathProps {
  current: number;
  total: number;
}

/**
 * WayPath - Visualizador de camino de progreso.
 * Muestra el progreso actual junto al porcentaje de una forma lúdica.
 */
export function WayPath({ current, total }: WayPathProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex items-center gap-5 bg-white/60 backdrop-blur-xl p-4 rounded-[24px] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ 
              scale: i === current - 1 ? 1.4 : (i < current ? 1 : 0.7),
              background: i < current 
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              boxShadow: i < current 
                ? '0 4px 12px rgba(79,70,229,0.3)' 
                : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-4 h-4 rounded-full border-2 border-white relative"
          >
            {i === current - 1 && (
              <motion.div 
                layoutId="path-active"
                className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border-2 border-indigo-400 opacity-50"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1">Tu Camino</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">
            {current}
          </span>
          <span className="text-sm font-bold text-slate-400">/</span>
          <span className="text-sm font-bold text-slate-400 tabular-nums">
            {total}
          </span>
          <div className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-sm">
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
}
