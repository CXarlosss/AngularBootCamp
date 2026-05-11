import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/core/utils/audioService';

/**
 * RelaxationTimer - Timer de relajación con sistema de medallas.
 * Rango: 1-5 min.
 * Recompensas: 10-50 medallas según el tiempo.
 */
export function RelaxationTimer() {
  const [duration, setDuration] = useState(1); // minutos
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsFinished(false);
    audioService.playAmbient('zen-stream');
  };

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    audioService.stopAmbient();
    audioService.playSFX('success');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const medalReward = duration * 10;

  return (
    <div className="max-w-md mx-auto bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-indigo-100 text-center">
      <h2 className="text-3xl font-black text-indigo-900 mb-2">Momento Relax</h2>
      <p className="text-slate-500 mb-8">Tómate un respiro para ganar medallas</p>

      {!isActive && !isFinished && (
        <div className="space-y-8">
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 5].map(min => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`w-14 h-14 rounded-2xl font-bold transition-all ${duration === min ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'}`}
              >
                {min}'
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-amber-500 font-bold">
            <span className="text-2xl">🏅</span>
            <span>Gana {medalReward} medallas</span>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            Comenzar
          </button>
        </div>
      )}

      {isActive && (
        <div className="py-12">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl font-black text-indigo-600 mb-4 font-mono"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-indigo-400 font-medium animate-pulse">Respira suavemente...</p>
        </div>
      )}

      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 space-y-4"
          >
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-black text-indigo-900">¡Lo lograste!</h3>
            <div className="bg-amber-100 text-amber-900 py-3 px-6 rounded-2xl font-bold inline-block">
              + {medalReward} Medallas 🏅
            </div>
            <button
              onClick={() => setIsFinished(false)}
              className="block w-full text-indigo-600 font-bold hover:underline mt-4"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
