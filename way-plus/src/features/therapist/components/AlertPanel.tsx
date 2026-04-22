import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { AlertCircle, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info';
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

export const AlertPanel: React.FC = () => {
  const { profile, relaxationLog = {}, roleplayLog = {} } = usePlayerStore();
  const completedWays = profile?.completedWays || [];
  const { streakDays = 0 } = useRewardsStore();

  const alerts = useMemo(() => {
    const list: Alert[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    if (!relaxationLog[today]?.completed) {
      list.push({
        id: 'no-relax',
        type: 'warning',
        icon: <ShieldAlert size={20} />,
        title: 'Relajación Pendiente',
        message: 'El niño no ha practicado hoy. Riesgo de desregulación.',
        color: 'bg-amber-50 border-amber-200 text-amber-800'
      });
    }
    
    if (streakDays > 3) {
      list.push({
        id: 'streak',
        type: 'success',
        icon: <Sparkles size={20} />,
        title: 'Racha Activa',
        message: `Lleva ${streakDays} días de adherencia perfecta. ¡Reforzar!`,
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
      });
    }
    
    if (completedWays.length > 5) {
      list.push({
        id: 'mastery',
        type: 'info',
        icon: <Zap size={20} />,
        title: 'Maestría detectada',
        message: 'Progreso rápido en Nivel 1. Considerar subir dificultad.',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    }
    
    return list;
  }, [relaxationLog, streakDays, completedWays]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
          <div className="w-2 h-6 bg-primary-500 rounded-full" />
          Alertas Clínicas
        </h3>
        <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          {alerts.length} Activas
        </span>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-[2rem] border-2 shadow-xl shadow-slate-200/50 relative overflow-hidden group ${alert.color}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                {alert.icon}
              </div>

              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                    {alert.title}
                    {alert.type === 'warning' && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                  </h4>
                  <p className="text-xs font-bold opacity-70 mt-1 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="py-16 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 premium-shadow">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Sparkles size={32} className="text-slate-200" />
            </div>
            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Estabilidad Clínica Detectada</p>
          </div>
        )}
      </div>
    </div>
  );
};

