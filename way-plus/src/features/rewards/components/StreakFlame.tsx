import React from 'react';
import { motion } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';

export const StreakFlame: React.FC = () => {
  const { streakDays } = useRewardsStore();
  
  if (streakDays === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-xl border-4 border-white"
    >
      <div className="relative">
        <motion.span 
          className="text-3xl block"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            filter: ['drop-shadow(0 0 0px #fb923c)', 'drop-shadow(0 0 10px #fb923c)', 'drop-shadow(0 0 0px #fb923c)']
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🔥
        </motion.span>
      </div>
      <div className="flex flex-col">
        <span className="font-black text-2xl leading-none">{streakDays}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Días seguidos</span>
      </div>
    </motion.div>
  );
};
