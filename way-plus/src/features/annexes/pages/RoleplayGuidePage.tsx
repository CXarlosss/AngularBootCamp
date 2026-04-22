import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { format } from 'date-fns';
import { ArrowLeft, Play, Users, MessageSquare, Shield, Star, CheckCircle } from 'lucide-react';

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

  const todayLog = roleplayLog[today] || [];

  const handlePractice = (wayId: string) => {
    logRoleplay(today, wayId);
    setSelectedScenario(null);
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-orange-50 to-rose-100 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/annexes')}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-orange-600"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-orange-900 tracking-tighter">Role Playing</h1>
            <p className="text-orange-600 font-bold uppercase tracking-widest text-sm">Anexo 3: Práctica Social</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {selectedScenario ? (
            <motion.div
              key="active-scenario"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-orange-200 space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner">
                  {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.title}
                  </h2>
                  <p className="text-orange-500 font-bold uppercase tracking-widest">Misión: {ROLEPLAY_SCENARIOS.find(s => s.wayId === selectedScenario)?.step}</p>
                </div>
              </div>

              <div className="bg-orange-50 rounded-[2rem] p-8 space-y-6">
                <h3 className="text-xl font-black text-orange-900 flex items-center gap-2">
                  <Users size={24} />
                  Guía para el Adulto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GuideStep icon={<MessageSquare size={18} />} text="Explica la situación con calma" />
                  <GuideStep icon={<Users size={18} />} text="Tú haces el papel del otro primero" />
                  <GuideStep icon={<Play size={18} />} text="Luego intercambiad los papeles" />
                  <GuideStep icon={<Star size={18} />} text="Refuerza cada pequeño acierto" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePractice(selectedScenario)}
                  className="flex-1 bg-emerald-500 text-white py-6 rounded-[2rem] text-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                >
                  <CheckCircle size={28} />
                  ¡LO HEMOS LOGRADO!
                </motion.button>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="px-8 bg-slate-100 text-slate-500 rounded-[2rem] font-bold hover:bg-slate-200 transition-colors"
                >
                  VOLVER
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ROLEPLAY_SCENARIOS.map((scenario) => (
                  <motion.button
                    key={scenario.wayId}
                    whileHover={{ scale: 1.03, translateY: -5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedScenario(scenario.wayId)}
                    className={`p-8 rounded-[2.5rem] text-left shadow-xl border-4 transition-all duration-300 relative group
                      ${todayLog.includes(scenario.wayId) 
                        ? 'bg-emerald-50 border-emerald-300' 
                        : 'bg-white border-transparent hover:border-orange-300'
                      }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{scenario.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-800 leading-tight">{scenario.title}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{scenario.step}</p>
                      </div>
                    </div>
                    {todayLog.includes(scenario.wayId) && (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-sm bg-white/80 w-fit px-3 py-1 rounded-full border border-emerald-100">
                        <CheckCircle size={16} />
                        Practicado hoy
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Weekly Tracker */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white">
                <h3 className="text-2xl font-black text-slate-800 mb-8">Nuestra Semana</h3>
                <div className="flex justify-between gap-4">
                  {WEEK_DAYS.map((day, idx) => {
                    const date = new Date();
                    const dayDiff = idx - todayIndex;
                    const targetDate = format(new Date(date.setDate(date.getDate() + dayDiff)), 'yyyy-MM-dd');
                    const dayLog = roleplayLog[targetDate] || [];
                    const isToday = idx === todayIndex;
                    
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-3">
                        <span className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-orange-600' : 'text-slate-400'}`}>
                          {day.slice(0,3)}
                        </span>
                        <div className={`w-full aspect-square rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-500
                          ${dayLog.length > 0 ? 'bg-orange-400 text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-300'}
                        `}>
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
  <div className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-white">
    <div className="text-orange-500">{icon}</div>
    <span className="font-bold text-slate-700 text-sm">{text}</span>
  </div>
);
