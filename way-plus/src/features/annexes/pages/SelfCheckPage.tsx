import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const C = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  indigoSoft: '#E0E7FF',
  indigoDark: '#312E81',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  slate: '#64748B',
  slateDark: '#1E293B',
  white: '#ffffff',
};

const TRACKABLE_ITEMS = [
  { id: 'relaxation', label: 'Relajación', emoji: '🧘', category: 'base' as const },
  { id: 'autonomy', label: 'Autonomía', emoji: '🌟', category: 'base' as const },
  { id: 'assertiveness', label: 'Asertividad', emoji: '🗣️', category: 'base' as const },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `way-${i + 1}`,
    label: `Reto WAY ${i + 1}`,
    emoji: '🎯',
    category: 'way' as const,
  })),
];

export const SelfCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { weeklyCheck, toggleWeeklyCheck, profile } = usePlayerStore();
  const [currentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handleToggle = (itemId: string, dateStr: string, isChecked: boolean) => {
    toggleWeeklyCheck(itemId, dateStr);
    if (!isChecked) {
      useRewardsStore.getState().addCoins(5, 'weekly-check');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-24" style={{ fontFamily: 'Verdana, sans-serif' }}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-100 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto p-4 sm:p-6 space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/annexes')}
            className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-50"
          >
            <span className="text-2xl">←</span>
          </motion.button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Mi Diario</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Semanario de Retos</p>
          </div>
        </header>

        {/* Current Date Label */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">📅</div>
             <div>
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Semana Actual</span>
                <span className="block text-sm font-bold text-slate-700 capitalize">
                  {format(weekDays[0], "d 'de' MMMM", { locale: es })} - {format(weekDays[6], "d 'de' MMMM", { locale: es })}
                </span>
             </div>
          </div>
        </div>

        {/* Activity Cards */}
        <div className="space-y-4">
          {TRACKABLE_ITEMS.map((item, idx) => {
             const isUnlocked = item.category === 'base' || (profile?.completedWays || []).includes(item.id);
             
             return (
               <motion.div
                 key={item.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className={`relative bg-white rounded-[2.5rem] p-6 border-2 transition-all ${
                   isUnlocked ? 'border-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.08)]' : 'border-slate-100 opacity-60 grayscale'
                 }`}
               >
                 {/* Card Header */}
                 <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">{item.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-800 leading-tight">{item.label}</h3>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                        {item.category === 'base' ? 'Habilidad Base' : 'Reto Individual'}
                      </span>
                    </div>
                    {!isUnlocked && (
                      <div className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200">
                        BLOQUEADO
                      </div>
                    )}
                 </div>

                 {/* Days Strip */}
                 <div className="flex justify-between items-center gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {weekDays.map((date, dIdx) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isChecked = !!weeklyCheck[`${item.id}-${dateStr}`];
                      const isToday = isSameDay(date, new Date());
                      
                      return (
                        <div key={dateStr} className="flex flex-col items-center gap-2 min-w-[42px]">
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-indigo-600' : 'text-slate-300'}`}>
                            {WEEK_DAYS[dIdx].slice(0,3)}
                          </span>
                          <motion.button
                            whileTap={isUnlocked ? { scale: 0.85 } : {}}
                            disabled={!isUnlocked}
                            onClick={() => handleToggle(item.id, dateStr, isChecked)}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                              isChecked 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                                : isUnlocked 
                                  ? 'bg-indigo-50/50 text-indigo-200 border-2 border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-100' 
                                  : 'bg-slate-50 text-transparent'
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {isChecked ? (
                                <motion.span 
                                  key="check"
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-xl"
                                >
                                  ✓
                                </motion.span>
                              ) : (
                                <span className="text-lg font-black">{format(date, 'd')}</span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                          {isToday && <div className="w-1 h-1 bg-indigo-500 rounded-full" />}
                        </div>
                      );
                    })}
                 </div>
               </motion.div>
             );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-[#1E1B4B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">💡</div>
               <h4 className="text-xl font-black tracking-tight">Tu Diario de Éxitos</h4>
            </div>
            <p className="text-indigo-100/70 text-sm font-medium leading-relaxed">
              Marca los retos que has logrado hoy. Cada vez que consigues uno en el mundo real, ¡ganas 5 monedas! 🪙
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Logrado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/20 rounded-full border border-white/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Pendiente</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
