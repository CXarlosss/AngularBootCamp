import React from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export const WeeklySummary: React.FC = () => {
  const { relaxationLog } = usePlayerStore();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="mt-12 bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-xl">
      <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <span>📅</span> Resumen de la Semana
      </h3>
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isDone = !!relaxationLog[dateKey]?.completed;
          const isToday = isSameDay(day, new Date());

          return (
            <div key={dateKey} className="flex flex-col items-center gap-3">
              <span className={`text-sm font-bold uppercase tracking-widest ${isToday ? 'text-primary-600' : 'text-slate-400'}`}>
                {format(day, 'eee')}
              </span>
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500
                ${isDone ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-300'}
                ${isToday && !isDone ? 'ring-4 ring-primary-200 animate-pulse' : ''}
              `}>
                {isDone ? '⭐' : '○'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
