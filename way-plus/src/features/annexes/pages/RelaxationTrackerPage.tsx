import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { format } from 'date-fns';
import { ArrowLeft, Clock, MapPin, User, Wind, CheckCircle2 } from 'lucide-react';

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const RelaxationTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { relaxationLog, logRelaxation } = usePlayerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  
  const [isPracticing, setIsPracticing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [checks, setChecks] = useState({
    room: false,
    chair: false,
    posture: false,
    breathing: false,
    accompanied: false,
  });
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allChecks = Object.values(checks).every(Boolean);
  
  const startPractice = () => {
    if (!allChecks) return;
    setIsPracticing(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completePractice = () => {
    logRelaxation(today, {
      completed: true,
      duration: 5,
      posture: checks.posture,
      breathing: checks.breathing,
      accompanied: checks.accompanied,
      location: checks.room ? 'room' : 'other',
    });
    
    // Disparar recompensa
    useRewardsStore.getState().celebrateCompletion('annex');
    
    setIsPracticing(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-emerald-50 to-emerald-100 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/annexes')}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-emerald-600"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-emerald-900 tracking-tighter">Relajación</h1>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm">Anexo 1: Calma y Bienestar</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checklist Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white space-y-6">
            <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" />
              Lista de Calma
            </h2>
            <div className="space-y-4">
              {[
                { key: 'room', label: 'Lugar sin ruidos', icon: <MapPin size={20} /> },
                { key: 'chair', label: 'Silla cómoda', icon: <User size={20} /> },
                { key: 'posture', label: 'Pies en el suelo', icon: <Wind size={20} /> },
                { key: 'breathing', label: 'Respiro despacio', icon: <Wind size={20} /> },
                { key: 'accompanied', label: 'Estoy acompañado', icon: <User size={20} /> },
              ].map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => setChecks(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof checks] }))}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300
                    ${checks[item.key as keyof typeof checks] 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={checks[item.key as keyof typeof checks] ? 'text-white' : 'text-emerald-500'}>
                      {item.icon}
                    </span>
                    <span className="text-lg font-black">{item.label}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors
                    ${checks[item.key as keyof typeof checks] ? 'border-white bg-white/20' : 'border-slate-200'}
                  `}>
                    {checks[item.key as keyof typeof checks] && <CheckCircle2 size={20} />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Timer Section */}
          <div className="flex flex-col gap-8">
            <AnimatePresence mode="wait">
              {isPracticing ? (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[2.5rem] p-12 shadow-2xl flex-1 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <svg className="w-48 h-48 -rotate-90">
                      <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      <motion.circle 
                        cx="96" cy="96" r="88" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={553}
                        animate={{ strokeDashoffset: 553 - (timeLeft / 300) * 553 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-slate-800 tabular-nums">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-600 animate-pulse uppercase tracking-widest">Inspirar... Expirar...</p>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-7xl"
                  >
                    🍃
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col justify-between space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-800">Práctica Diaria</h3>
                    <p className="text-slate-500 font-medium">Completa la lista de calma para activar el temporizador.</p>
                  </div>
                  
                  <motion.button
                    whileHover={allChecks ? { scale: 1.02 } : {}}
                    whileTap={allChecks ? { scale: 0.98 } : {}}
                    onClick={startPractice}
                    disabled={!allChecks}
                    className={`w-full py-8 rounded-[2rem] text-2xl font-black shadow-xl transition-all flex items-center justify-center gap-4
                      ${allChecks 
                        ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                      }`}
                  >
                    <Clock size={32} />
                    {relaxationLog[today]?.completed ? 'REPETIR PRÁCTICA' : 'EMPEZAR (5 MIN)'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weekly Progress mini-track */}
            <div className="bg-white/40 backdrop-blur p-6 rounded-[2rem] border border-white">
              <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4">Progreso Semanal</h4>
              <div className="flex justify-between gap-2">
                {WEEK_DAYS.map((day, idx) => {
                  const dateKey = format(new Date(Date.now() - (todayIndex - idx) * 86400000), 'yyyy-MM-dd');
                  const isDone = !!relaxationLog[dateKey]?.completed;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl shadow-sm border-2
                        ${isDone ? 'bg-emerald-400 border-emerald-400 text-white' : 'bg-white border-white/50 text-slate-200'}`}>
                        {isDone ? '★' : ''}
                      </div>
                      <span className="text-[10px] font-black text-emerald-800/50 uppercase">{day.slice(0,3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
