import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';

export const SessionTimer: React.FC<{ locked?: boolean }> = ({ locked }) => {
  const [seconds, setSeconds] = useState(300); // 5 minutos por defecto
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setSeconds(300);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / 300) * 100;

  return (
    <div className={`bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8 relative overflow-hidden transition-all duration-500
      ${locked ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}
    `}>
      {locked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="bg-white/80 px-6 py-2 rounded-full shadow-lg border border-white">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Bloqueado</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <TimerIcon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">Temporizador Clínico</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sesión de Relajación</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center py-4">
        {/* Progress Ring Background */}
        <svg className="w-48 h-48 -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-50"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray="553"
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            className="text-primary-500"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-slate-900 tracking-tighter">
            {formatTime(seconds)}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">minutos</span>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
            ${isActive ? 'bg-amber-100 text-amber-700' : 'bg-primary-600 text-white shadow-lg shadow-primary-200'}
          `}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? 'Pausar' : 'Empezar'}
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
        >
          <RotateCcw size={24} />
        </motion.button>
      </div>
    </div>
  );
};
