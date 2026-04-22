import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { Calendar, CheckCircle2 } from 'lucide-react';

const ANNEX_TYPES = [
  { key: 'relaxationLog', label: 'Relajación', icon: '🧘', color: 'bg-teal-500', text: 'text-teal-700', bg: 'bg-teal-50' },
  { key: 'roleplayLog', label: 'Roleplay', icon: '🎭', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  { key: 'weeklyCheck', label: 'Autocomp.', icon: '📊', color: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50' },
];

export const AnnexCompliance: React.FC = () => {
  const { relaxationLog = {}, roleplayLog = {}, weeklyCheck = {} } = usePlayerStore();

  const last14Days = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('es', { weekday: 'narrow' }),
      });
    }
    return days;
  }, []);

  const getCompliance = (type: string, date: string) => {
    if (type === 'relaxationLog') return !!relaxationLog[date]?.completed;
    if (type === 'roleplayLog') return !!(roleplayLog[date]?.length > 0);
    if (type === 'weeklyCheck') {
      const dayChecks = Object.entries(weeklyCheck).filter(([key]) => key.endsWith(date));
      return dayChecks.filter(([, v]) => v).length >= 1;
    }
    return false;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-white overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Calendar size={120} />
      </div>

      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Mapa de Adherencia</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Registro Clínico (14 días)</p>
        </div>
      </div>
      
      <div className="space-y-10">
        {ANNEX_TYPES.map((annex) => {
          const completedCount = last14Days.filter(d => getCompliance(annex.key, d.date)).length;
          
          return (
            <div key={annex.key} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${annex.bg} flex items-center justify-center text-2xl shadow-inner`}>
                    {annex.icon}
                  </div>
                  <div>
                    <span className="font-black text-slate-700 uppercase tracking-tight block">{annex.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad Diaria</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${annex.text}`}>{Math.round((completedCount / 14) * 100)}%</span>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Cumplimiento</p>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-7 gap-2">
                {last14Days.map((day) => {
                  const done = getCompliance(annex.key, day.date);
                  return (
                    <motion.div
                      key={day.date}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className={`h-12 rounded-xl flex items-center justify-center text-white transition-all duration-500 cursor-default relative group
                        ${done ? annex.color : 'bg-slate-50 border-2 border-slate-100/50'}
                      `}
                    >
                      {done && <CheckCircle2 size={14} strokeWidth={4} />}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold z-50">
                        {day.date} - {done ? 'Completado' : 'Pendiente'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center gap-8 border-t border-slate-50 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-50 border-2 border-slate-100 rounded-lg"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin Registro</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-primary-500 rounded-lg shadow-sm"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Lograda</span>
        </div>
      </div>
    </motion.div>
  );
};

