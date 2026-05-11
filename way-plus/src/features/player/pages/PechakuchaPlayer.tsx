import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/core/utils/audioService';

interface Slide {
  id: number;
  image: string;
  text: string;
}

/**
 * PechakuchaPlayer - Modo presentación automática.
 * 20 segundos por diapositiva.
 */
export function PechakuchaPlayer({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);

  const words = slides[currentIndex].text.split(' ');

  const handleSpeak = useCallback(() => {
    audioService.speak(slides[currentIndex].text, {
      rate: 0.85,
      onWord: (index) => setActiveWordIndex(index)
    });
  }, [currentIndex, slides]);

  useEffect(() => {
    if (isPlaying) {
      handleSpeak();
    } else {
      audioService.stopSpeak();
      setActiveWordIndex(-1);
    }
    return () => audioService.stopSpeak();
  }, [isPlaying, currentIndex, handleSpeak]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(20);
        setActiveWordIndex(-1);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, currentIndex, slides.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[currentIndex].image} 
            alt={slides[currentIndex].text}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-12">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black text-white max-w-3xl leading-snug flex flex-wrap gap-x-2"
            >
              {words.map((word, i) => (
                <span 
                  key={i}
                  className={`transition-colors duration-200 ${i === activeWordIndex ? 'text-indigo-400 scale-110' : 'text-white'}`}
                >
                  {word}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Ring / Timer */}
      <div className="absolute top-8 right-8 w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke="#6366f1"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="175.9"
            animate={{ strokeDashoffset: 175.9 * (1 - timeLeft / 20) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <span className="absolute text-white font-black text-xl">{timeLeft}</span>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-4 items-center">
           <button 
             onClick={togglePlay}
             className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full text-white flex items-center justify-center text-3xl shadow-xl hover:bg-white/30 transition-all"
           >
             {isPlaying ? '⏸' : '▶️'}
           </button>
           <div className="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
             <span className="text-white font-black tracking-widest uppercase text-xs">
               Paso {currentIndex + 1} de {slides.length}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}
