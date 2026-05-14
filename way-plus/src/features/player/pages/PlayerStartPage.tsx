import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/core/utils/audioService';

/**
 * PlayerStartPage - Pantalla inicial renovada sin la poción.
 * Enfocada en la claridad y una bienvenida cálida para el niño.
 */
export function PlayerStartPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    audioService.playSFX('click');
    navigate('/player/home');
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden min-h-[calc(100dvh-128px)]" style={{
      background: 'radial-gradient(circle at 50% 50%, #F8FAFF 0%, #E8EDFF 100%)'
    }}>
      {/* Background Decor */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-200 rounded-full blur-[80px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-200 rounded-full blur-[100px]"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center z-10 w-full max-w-sm flex flex-col items-center gap-10"
      >
        {/* Hero Illustration */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-indigo-400 blur-[60px] opacity-20 rounded-full scale-110" />
          <img 
            src="/assets/hero.png" 
            alt="WAY+ Mascot" 
            className="w-64 h-64 object-contain relative drop-shadow-[0_20px_30px_rgba(79,70,229,0.2)]" 
          />
        </motion.div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-[#1E1B4B] tracking-tight leading-[0.9]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            ¡EMPEZAR!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em]"
          >
            Tu aventura WAY+ te espera
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleStart}
          className="w-full py-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-2xl font-black rounded-[28px] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] border-b-[6px] border-indigo-900 active:border-b-0 transition-all flex items-center justify-center gap-3"
        >
          ¡ADELANTE! 🚀
        </motion.button>
      </motion.div>

      {/* Decorative floating dots */}
      <div className="absolute bottom-6 flex gap-3 opacity-30">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className="w-2 h-2 bg-indigo-400 rounded-full" 
          />
        ))}
      </div>
    </div>
  );
}

