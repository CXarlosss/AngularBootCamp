import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { format } from 'date-fns';

const C = {
  orange: '#F97316',
  orangeLight: '#FFF7ED',
  orangeDark: '#9A3412',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  slate: '#64748B',
  slateDark: '#1E293B',
  slateLight: '#F1F5F9',
  white: '#ffffff',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ROLEPLAY_SCENARIOS = [
  { wayId: 'way-1', title: 'Llamar a la puerta y pedir permiso', icon: '🚪', step: 'Asertividad' },
  { wayId: 'way-2', title: 'Hacer favores y ayudar a otros', icon: '🤝', step: 'Asertividad' },
  { wayId: 'way-3', title: 'Pedir jugar con otros niños', icon: '🧒', step: 'Asertividad' },
  { wayId: 'way-6', title: 'Defenderse con palabras, no golpes', icon: '🛡️', step: 'Asertividad' },
  { wayId: 'way-9', title: 'Lavarse las manos antes de comer', icon: '🧼', step: 'Autonomía' },
  { wayId: 'way-11', title: 'Lavarse los dientes correctamente', icon: '🦷', step: 'Autonomía' },
  { wayId: 'way-14', title: 'Preparar la mochila para el cole', icon: '🎒', step: 'Autonomía' },
  { wayId: 'way-23', title: 'Comer educadamente en la mesa', icon: '🍽️', step: 'Autonomía' },
];

export const RoleplayGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { roleplayLog, logRoleplay } = usePlayerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const todayLog = (roleplayLog || {})[today] || [];

  const handlePractice = (wayId: string) => {
    logRoleplay(today, wayId);
    setSelectedScenario(null);
  };

  return (
    <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.orangeLight}, #FFEDD5)`, padding: '24px 16px', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/annexes')}
            style={{ width: 48, height: 48, borderRadius: 16, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.15)', cursor: 'pointer', fontSize: 20, color: C.orange }}
          >
            ←
          </motion.button>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.orangeDark, margin: 0 }}>Role Playing</h1>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Práctica Social</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {selectedScenario ? (
            <motion.div
              key="active-scenario"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: C.white, borderRadius: 32, padding: 32, boxShadow: '0 12px 40px rgba(249,115,22,0.15)', border: `4px solid #FFEDD5`, display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 80, height: 80, background: C.orangeLight, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.05)' }}>
                  {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: C.slateDark, margin: '0 0 4px' }}>
                    {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.title}
                  </h2>
                  <p style={{ fontSize: 12, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Misión: {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.step}</p>
                </div>
              </div>

              <div style={{ background: C.orangeLight, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: C.orangeDark, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  👨‍👩‍👧‍👦 Guía para el Adulto
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <GuideStep icon="💬" text="Explica la situación con calma" />
                  <GuideStep icon="👥" text="Tú haces el papel del otro primero" />
                  <GuideStep icon="🔁" text="Luego intercambiad los papeles" />
                  <GuideStep icon="⭐" text="Refuerza cada pequeño acierto" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePractice(selectedScenario)}
                  style={{ width: '100%', padding: 20, borderRadius: 24, background: C.emerald, color: C.white, fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  ✓ ¡LO HEMOS LOGRADO!
                </motion.button>
                <button
                  onClick={() => setSelectedScenario(null)}
                  style={{ width: '100%', padding: 16, borderRadius: 24, background: C.slateLight, color: C.slate, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer' }}
                >
                  VOLVER
                </button>
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {ROLEPLAY_SCENARIOS.map((scenario) => {
                  const isDone = (todayLog || []).includes(scenario.wayId);
                  return (
                    <motion.button
                      key={scenario.wayId}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedScenario(scenario.wayId)}
                      style={{
                        padding: 24, borderRadius: 32, textAlign: 'left', cursor: 'pointer', border: isDone ? `4px solid ${C.emeraldLight}` : '4px solid transparent', transition: 'all 0.2s', position: 'relative',
                        background: isDone ? C.emeraldLight : C.white,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: isDone ? 12 : 0 }}>
                        <span style={{ fontSize: 32 }}>{scenario.icon}</span>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 900, color: C.slateDark, margin: '0 0 4px', lineHeight: 1.2 }}>{scenario.title}</h3>
                          <p style={{ fontSize: 11, fontWeight: 800, color: C.slate, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>{scenario.step}</p>
                        </div>
                      </div>
                      {isDone && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.white, padding: '4px 12px', borderRadius: 20, border: `1px solid ${C.emeraldLight}`, color: C.emerald, fontSize: 12, fontWeight: 900 }}>
                          ✓ Practicado hoy
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Weekly Tracker */}
              <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: 32, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '2px solid white' }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: C.slateDark, marginBottom: 24, marginTop: 0 }}>Nuestra Semana</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {WEEK_DAYS.map((day, idx) => {
                    const date = new Date();
                    const dayDiff = idx - todayIndex;
                    const targetDate = format(new Date(date.setDate(date.getDate() + dayDiff)), 'yyyy-MM-dd');
                    const dayLog = (roleplayLog || {})[targetDate] || [];
                    const isToday = idx === todayIndex;
                    
                    return (
                      <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: isToday ? C.orange : C.slate }}>
                          {day.slice(0,3)}
                        </span>
                        <div style={{
                          width: '100%', aspectRatio: '1/1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900,
                          background: dayLog.length > 0 ? C.orange : C.slateLight,
                          color: dayLog.length > 0 ? C.white : C.slate,
                          boxShadow: dayLog.length > 0 ? '0 4px 12px rgba(249,115,22,0.2)' : 'none'
                        }}>
                          {dayLog.length > 0 ? dayLog.length : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const GuideStep = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.7)', padding: 16, borderRadius: 16, border: '1px solid white' }}>
    <div style={{ fontSize: 20 }}>{icon}</div>
    <span style={{ fontWeight: 800, color: C.slateDark, fontSize: 14 }}>{text}</span>
  </div>
);
