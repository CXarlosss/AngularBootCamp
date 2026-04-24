import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '../store/rewardsStore';

interface ProgressLadderProps {
  stepWays: string[]; // IDs de los ways del step actual
}

export const ProgressLadder: React.FC<ProgressLadderProps> = ({ stepWays }) => {
  const { profile } = usePlayerStore();
  const { currentAvatar } = useRewardsStore();
  
  const completedCount = stepWays.filter(id => (profile?.completedWays || []).includes(id)).length;
  const total = stepWays.length;
  const progress = (completedCount / total) * 100;

  const getAvatarEmoji = () => {
    switch (currentAvatar.base) {
      case 'base-unicorn': return '🦄';
      case 'base-dragon': return '🐉';
      case 'base-puppy': return '🐶';
      case 'base-kitten': return '🐱';
      default: return '🦄';
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto py-12 px-6 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white shadow-xl">
      <h3 className="text-center text-2xl font-black text-slate-800 mb-10 tracking-tight">
        ¡Llega hasta tu <span className="text-primary-500 uppercase">{currentAvatar.base.split('-')[1]}</span>!
      </h3>
      
      <div className="relative h-80 flex items-end justify-center">
        {/* Rail de la escalera */}
        <div className="absolute inset-x-12 bottom-0 top-0 bg-slate-200/50 rounded-full overflow-hidden border-4 border-white shadow-inner">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400 via-teal-400 to-cyan-300"
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          />
        </div>
        
        {/* Peldaños y Marcas */}
        <div className="absolute inset-0 flex flex-col-reverse justify-between py-2">
          {stepWays.map((wayId, index) => {
            const isCompleted = (profile?.completedWays || []).includes(wayId);
            return (
              <div key={wayId} className="relative flex items-center justify-center w-full h-12">
                 <motion.div
                  initial={false}
                  animate={{
                    scale: isCompleted ? 1.2 : 1,
                    backgroundColor: isCompleted ? '#10b981' : '#ffffff',
                    rotate: isCompleted ? [0, 5, -5, 0] : 0
                  }}
                  className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-4 
                    ${isCompleted ? 'border-emerald-200' : 'border-slate-100'}`}
                >
                  <span className={`text-xl font-black ${isCompleted ? 'text-white' : 'text-slate-300'}`}>
                    {isCompleted ? '⭐' : index + 1}
                  </span>
                </motion.div>
                
                {/* Etiqueta lateral */}
                <div className={`absolute left-full ml-4 whitespace-nowrap text-xs font-black uppercase tracking-widest transition-colors
                  ${isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                  WAY {index + 1}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Avatar en la posición actual */}
        <motion.div
          className="absolute z-20 text-7xl filter drop-shadow-2xl"
          initial={{ bottom: '0%' }}
          animate={{ bottom: `calc(${progress}% - 30px)` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        >
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {getAvatarEmoji()}
          </motion.div>
          
          {/* Sombrero si lo tiene */}
          {currentAvatar.hat !== 'hat-none' && (
            <div className="absolute -top-4 -right-2 text-4xl">
               {currentAvatar.hat === 'hat-crown' && '👑'}
               {currentAvatar.hat === 'hat-cap' && '🧢'}
               {currentAvatar.hat === 'hat-bow' && '🎀'}
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="text-center mt-12 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
        <span className="text-xl font-black text-emerald-600 block">
          {completedCount} / {total} RETOS LOGRADOS
        </span>
        <div className="w-full h-2 bg-emerald-100 rounded-full mt-2 overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
