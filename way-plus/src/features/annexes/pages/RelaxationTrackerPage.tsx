import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { format } from 'date-fns';

const C = {
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  emeraldDark: '#064E3B',
  emeraldMuted: '#A7F3D0',
  white: '#ffffff',
  slate: '#64748B',
  slateDark: '#1E293B',
  slateLight: '#F1F5F9',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const RelaxationTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { relaxationLog, logRelaxation } = usePlayerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  
  const [isPracticing, setIsPracticing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [checks, setChecks] = useState({
    room: false, chair: false, posture: false, breathing: false, accompanied: false,
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
      completed: true, duration: 5, posture: checks.posture,
      breathing: checks.breathing, accompanied: checks.accompanied,
      location: checks.room ? 'room' : 'other',
    });
    useRewardsStore.getState().celebrateCompletion('annex');
    setIsPracticing(false);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.emeraldLight}, #D1FAE5)`, padding: '24px 16px', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/annexes')}
            style={{ width: 48, height: 48, borderRadius: 16, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.15)', cursor: 'pointer', fontSize: 20, color: C.emerald }}
          >
            ←
          </motion.button>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.emeraldDark, margin: 0 }}>Relajación</h1>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.emerald, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Calma y Bienestar</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Checklist */}
          <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: 32, padding: 24, boxShadow: '0 8px 32px rgba(16,185,129,0.1)', border: '2px solid white' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.emeraldDark, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Lista de Calma
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'room', label: 'Lugar sin ruidos', icon: '📍' },
                { key: 'chair', label: 'Silla cómoda', icon: '🪑' },
                { key: 'posture', label: 'Pies en el suelo', icon: '🦶' },
                { key: 'breathing', label: 'Respiro despacio', icon: '🌬️' },
                { key: 'accompanied', label: 'Estoy acompañado', icon: '🧑‍🤝‍🧑' },
              ].map((item) => {
                const checked = checks[item.key as keyof typeof checks];
                return (
                  <motion.button
                    key={item.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChecks(prev => ({ ...prev, [item.key]: !checked }))}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      background: checked ? C.emerald : C.white,
                      boxShadow: checked ? '0 8px 16px rgba(16,185,129,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                      color: checked ? C.white : C.slateDark
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{item.label}</span>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: 10, border: `2px solid ${checked ? 'white' : C.slateLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                      {checked && <span style={{ color: 'white', fontSize: 16 }}>✓</span>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Timer Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AnimatePresence mode="wait">
              {isPracticing ? (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ background: C.white, borderRadius: 32, padding: 32, boxShadow: '0 12px 40px rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
                >
                  <div style={{ position: 'relative', width: 200, height: 200 }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="100" cy="100" r="90" fill="none" stroke={C.slateLight} strokeWidth="12" />
                      <motion.circle 
                        cx="100" cy="100" r="90" fill="none" stroke={C.emerald} strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={565}
                        animate={{ strokeDashoffset: 565 - (timeLeft / 300) * 565 }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, color: C.slateDark }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.emerald, textTransform: 'uppercase', letterSpacing: 2 }}>Inspirar... Expirar...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: C.white, borderRadius: 32, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: C.slateDark, margin: '0 0 8px' }}>Práctica Diaria</h3>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.slate, margin: 0 }}>Completa la lista de calma para activar el temporizador.</p>
                  </div>
                  
                  <motion.button
                    whileTap={allChecks ? { scale: 0.96 } : {}}
                    onClick={startPractice}
                    disabled={!allChecks}
                    style={{
                      width: '100%', padding: 20, borderRadius: 24, fontSize: 18, fontWeight: 900, border: 'none', cursor: allChecks ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                      background: allChecks ? C.emerald : C.slateLight,
                      color: allChecks ? C.white : '#9CA3AF',
                      boxShadow: allChecks ? '0 12px 24px rgba(16,185,129,0.3)' : 'none'
                    }}
                  >
                    <span>⏱️</span>
                    {relaxationLog[today]?.completed ? 'REPETIR PRÁCTICA' : 'EMPEZAR (5 MIN)'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weekly Progress */}
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 24, padding: 20, border: '1px solid white' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: C.emeraldDark, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Progreso Semanal</h4>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {WEEK_DAYS.map((day, idx) => {
                  const dateKey = format(new Date(Date.now() - (todayIndex - idx) * 86400000), 'yyyy-MM-dd');
                  const isDone = !!relaxationLog[dateKey]?.completed;
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: '100%', aspectRatio: '1/1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900,
                        background: isDone ? C.emerald : C.white,
                        color: isDone ? C.white : C.emeraldMuted,
                        border: isDone ? 'none' : `2px solid ${C.emeraldLight}`
                      }}>
                        {isDone ? '★' : ''}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: C.emeraldDark, opacity: 0.6, textTransform: 'uppercase' }}>{day.slice(0,3)}</span>
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
