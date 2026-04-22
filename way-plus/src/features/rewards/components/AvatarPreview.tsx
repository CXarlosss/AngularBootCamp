import React from 'react';
import { motion } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';

export const AvatarPreview: React.FC = () => {
  const { previewAvatar, currentAvatar } = useRewardsStore();
  
  const avatar = previewAvatar;
  const isPreviewDifferent = JSON.stringify(previewAvatar) !== JSON.stringify(currentAvatar);

  const getBackgroundClass = () => {
    switch (avatar.background) {
      case 'background-space': return 'bg-slate-900';
      case 'background-garden': return 'bg-emerald-50';
      case 'background-castle': return 'bg-amber-50';
      case 'background-clouds': return 'bg-sky-50';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className={`aspect-square rounded-[3rem] flex items-center justify-center text-8xl relative overflow-hidden shadow-inner border-4 border-white
        ${getBackgroundClass()} transition-colors duration-500`}>
        
        {/* Background Decor */}
        {avatar.background === 'background-space' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span 
                key={i} 
                className="absolute text-xl opacity-40"
                initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2 + i, repeat: Infinity }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        )}
        
        {/* Composite Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Hat */}
          <div className="h-16 relative z-20">
            <AnimatePresence>
              {avatar.hat !== 'hat-none' && (
                <motion.div 
                  key={avatar.hat}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-7xl absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-lg"
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

          <div className="relative">
             {/* Cape (Behind) */}
             <div className="absolute -z-10 top-4 left-1/2 -translate-x-1/2 text-9xl opacity-80 filter blur-[1px]">
              {avatar.cape === 'cape-super' && '🦸'}
              {avatar.cape === 'cape-magic' && '✨'}
              {avatar.cape === 'cape-rainbow' && '🌈'}
            </div>

            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-[10rem] drop-shadow-2xl"
            >
              {avatar.base === 'base-unicorn' && '🦄'}
              {avatar.base === 'base-dragon' && '🐉'}
              {avatar.base === 'base-puppy' && '🐶'}
              {avatar.base === 'base-kitten' && '🐱'}
            </motion.div>

            {/* Shoes */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-6xl flex gap-1">
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
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30"
        >
          <span className="bg-amber-400 text-white px-6 py-2 rounded-full font-black text-sm shadow-xl border-2 border-white uppercase tracking-widest">
            Vista Previa
          </span>
        </motion.div>
      )}
    </div>
  );
};

import { AnimatePresence } from 'framer-motion';
