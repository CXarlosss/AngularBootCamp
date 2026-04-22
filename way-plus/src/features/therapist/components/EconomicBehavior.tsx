import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { SHOP_CATALOG } from '@/features/rewards/data/shopCatalog';
import { TrendingUp, Wallet, Brain, Target } from 'lucide-react';

export const EconomicBehavior: React.FC = () => {
  const { purchaseHistory, wayCoins, totalXp } = useRewardsStore();

  const analysis = useMemo(() => {
    if (purchaseHistory.length === 0) return null;

    const purchases = purchaseHistory.map(id => SHOP_CATALOG.find(i => i.id === id)).filter(Boolean);
    const totalSpent = purchases.reduce((sum, item) => sum + (item?.price || 0), 0);
    
    // Perfil de gasto por rareza
    const rarityBreakdown = purchases.reduce((acc, item) => {
      acc[item!.rarity] = (acc[item!.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ratio ahorro/gasto
    const savingRatio = wayCoins / (totalSpent + wayCoins || 1);
    
    let profile: string;
    let color: string;
    let recommendation: string;
    let icon: React.ReactNode;
    
    if (savingRatio > 0.7) {
      profile = 'Planificador Estratégico';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-100';
      icon = <Target className="text-emerald-500" />;
      recommendation = 'Excelente control inhibitorio. Puede tolerar recompensas diferidas. Introducir retos de espera proactiva.';
    } else if (savingRatio > 0.35) {
      profile = 'Perfil Equilibrado';
      color = 'text-blue-600 bg-blue-50 border-blue-100';
      icon = <TrendingUp className="text-blue-500" />;
      recommendation = 'Balance saludable entre gratificación inmediata y ahorro. Refuerza la planificación con metas visuales a 1 semana.';
    } else {
      profile = 'Impulsividad de Recompensa';
      color = 'text-amber-600 bg-amber-50 border-amber-100';
      icon = <Brain className="text-amber-500" />;
      recommendation = 'Alta impulsividad. Trabajar tolerancia a la frustración y delay de gratificación con economía de fichas física paralela.';
    }

    const pieData = Object.entries(rarityBreakdown).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    const COLORS = ['#94a3b8', '#3b82f6', '#a855f7', '#f59e0b'];

    return {
      totalSpent,
      savingRatio,
      profile,
      color,
      recommendation,
      pieData,
      icon,
      totalPurchases: purchases.length,
    };
  }, [purchaseHistory, wayCoins]);

  if (!analysis) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border-2 border-slate-100 text-center space-y-4">
        <div className="text-6xl grayscale opacity-20">🪙</div>
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sin datos económicos</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">El perfil conductual aparecerá cuando el niño realice sus primeras compras en la tienda.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-50 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Perfil Económico-Conductual</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Análisis de toma de decisiones</p>
        </div>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-black text-sm uppercase tracking-tighter ${analysis.color}`}>
          {analysis.icon}
          {analysis.profile}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Gastado" value={analysis.totalSpent} sub="WAYcoins" icon="💰" color="amber" />
        <StatItem label="Ahorro" value={wayCoins} sub="En hucha" icon="🏦" color="emerald" />
        <StatItem label="Ratio" value={`${Math.round(analysis.savingRatio * 100)}%`} sub="Tasa ahorro" icon="📈" color="blue" />
        <StatItem label="Items" value={analysis.totalPurchases} sub="Coleccionados" icon="🎁" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analysis.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {analysis.pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#94a3b8', '#3b82f6', '#a855f7', '#f59e0b'][index % 4]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rarezas</span>
            <span className="text-2xl font-black text-slate-800">{analysis.totalPurchases}</span>
          </div>
        </div>

        <div className="bg-indigo-50/50 rounded-3xl p-8 border-2 border-indigo-100 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="flex items-center gap-2 font-black text-indigo-900 mb-4 uppercase tracking-tighter">
              <Brain size={20} /> Interpretación Clínica
            </h4>
            <p className="text-base text-indigo-800/80 font-medium leading-relaxed italic">
              "{analysis.recommendation}"
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform duration-500">🧠</div>
        </div>
      </div>
    </motion.div>
  );
};

const StatItem = ({ label, value, sub, icon, color }: any) => {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className={`${colors[color]} rounded-3xl p-5 border-b-4 border-black/5`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black leading-none">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{label}</div>
    </div>
  );
};
