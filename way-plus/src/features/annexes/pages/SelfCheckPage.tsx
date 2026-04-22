import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { format, startOfWeek, addDays } from 'date-fns';
import { ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TRACKABLE_ITEMS = [
  { id: 'relaxation', label: '🧘 Práctica de Relajación', category: 'base' },
  { id: 'autonomy', label: '🌟 Autonomía', category: 'base' },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `way-${i + 1}`,
    label: `Reto WAY ${i + 1}`,
    category: 'way' as const,
  })),
];

export const SelfCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { weeklyCheck, toggleWeeklyCheck, profile } = usePlayerStore();
  const [currentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-50 to-indigo-100 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/annexes')}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-600"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-indigo-900 tracking-tighter">Autocomprobación</h1>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm">Anexo 2: Mi Diario Semanal</p>
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-6 text-left font-black text-xl tracking-tight min-w-[240px]">Actividad</th>
                  {WEEK_DAYS.map((day, idx) => (
                    <th key={day} className="p-6 text-center border-l border-white/10 min-w-[100px]">
                      <div className="text-xs font-black uppercase tracking-widest opacity-70">{day.slice(0,3)}</div>
                      <div className="text-2xl font-black">{format(weekDays[idx], 'd')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRACKABLE_ITEMS.map((item, rowIdx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                    className={`border-b border-indigo-50 last:border-0 hover:bg-indigo-50/30 transition-colors
                      ${item.category === 'base' ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className={`font-black tracking-tight ${item.category === 'base' ? 'text-indigo-900 text-lg' : 'text-slate-600'}`}>
                          {item.label}
                        </span>
                        {item.category === 'way' && (
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                            {profile.completedWays.includes(item.id) ? 'Desbloqueado' : 'Pendiente'}
                          </span>
                        )}
                      </div>
                    </td>
                    {weekDays.map((date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isChecked = !!weeklyCheck[`${item.id}-${dateStr}`];
                      const isDesbloqueado = item.category === 'base' || profile.completedWays.includes(item.id);
                      
                      return (
                        <td key={dateStr} className="p-2 border-l border-indigo-50">
                          <motion.button
                            whileTap={isDesbloqueado ? { scale: 0.9 } : {}}
                            disabled={!isDesbloqueado}
                            onClick={() => {
                              toggleWeeklyCheck(item.id, dateStr);
                              if (!isChecked) {
                                useRewardsStore.getState().addCoins(5, 'weekly-check');
                              }
                            }}
                            className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300
                              ${isChecked 
                                ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-100' 
                                : isDesbloqueado 
                                  ? 'bg-white border-2 border-indigo-100 text-indigo-100 hover:border-indigo-300' 
                                  : 'bg-slate-50 text-slate-100 cursor-not-allowed opacity-30'
                              }
                            `}
                          >
                            <CheckCircle2 size={isChecked ? 32 : 24} />
                          </motion.button>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-900 text-indigo-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
            <Info size={32} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xl font-black tracking-tight">Guía de Autocomprobación</h4>
            <p className="font-medium opacity-80">Marca los retos que has conseguido realizar en la vida real durante el día. ¡Sincérate contigo mismo!</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-400 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider">Conseguido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded-full border border-white/40" />
              <span className="text-xs font-bold uppercase tracking-wider">Pendiente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
