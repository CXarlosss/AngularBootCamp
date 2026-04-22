import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { TrendingUp, Award, Zap } from 'lucide-react';

export const ProgressTimeline: React.FC = () => {
  const { profile, relaxationLog = {} } = usePlayerStore();
  const completedWays = profile?.completedWays || [];
  const { totalXp = 0 } = useRewardsStore();

  const data = useMemo(() => {
    const days = [];
    let cumulativeWays = 0;
    let cumulativeXp = 0;
    
    // Generar 14 días de histórico simulado + actual
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Simular progresión lógica basada en los datos reales actuales
      const progressFactor = i === 0 ? 1 : Math.random();
      const waysToday = Math.floor((completedWays.length / 10) * progressFactor);
      cumulativeWays += waysToday;
      cumulativeXp += waysToday * 15;
      
      days.push({
        date: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        ways: cumulativeWays,
        xp: cumulativeXp,
      });
    }
    return days;
  }, [completedWays.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-50"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Evolución Terapéutica</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Crecimiento de habilidades y XP</p>
        </div>
        <TrendingUp className="text-primary-400" size={32} />
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
              dy={10}
            />
            <YAxis 
              hide 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '24px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '16px'
              }}
              itemStyle={{ fontWeight: 900, fontSize: '14px' }}
            />
            <Area 
              type="monotone" 
              dataKey="xp" 
              stroke="#6366f1" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorXp)" 
              name="Experiencia"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-6">
        <MetricCard label="Retos" value={completedWays.length} icon={<Zap size={20} />} color="blue" />
        <MetricCard label="Sesiones" value={Object.keys(relaxationLog).length} icon={<Award size={20} />} color="emerald" />
        <MetricCard label="XP Total" value={totalXp} icon={<TrendingUp size={20} />} color="indigo" />
      </div>
    </motion.div>
  );
};

const MetricCard = ({ label, value, icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <div className={`p-6 rounded-[2rem] border-2 ${colors[color]} text-center space-y-1`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-3xl font-black tracking-tighter leading-none">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</div>
    </div>
  );
};
