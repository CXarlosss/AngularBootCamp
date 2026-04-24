import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { ALL_STEPS } from '@/content/registry';

const C = {
  indigo: '#4F46E5',
  teal: '#14B8A6',
  amber: '#F59E0B',
  rose: '#F43F5E',
  purple: '#8B5CF6'
};

export const EvolutionCharts: React.FC = () => {
  const completedWays = usePlayerStore(s => s.profile?.completedWays || []);
  
  // 1. Mastery by Module
  const masteryData = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; color: string }> = {
      relaxation:    { total: 0, completed: 0, color: C.teal },
      autonomy:      { total: 0, completed: 0, color: C.amber },
      assertiveness: { total: 0, completed: 0, color: C.rose },
    };

    Object.values(ALL_STEPS).forEach(step => {
      const theme = step.theme || 'default';
      if (counts[theme]) {
        counts[theme].total += step.ways.length;
        step.ways.forEach(w => {
          if (completedWays.includes(w.id)) {
            counts[theme].completed += 1;
          }
        });
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      color: data.color
    }));
  }, [completedWays]);

  // 2. Weekly Activity (Mocked for now since we don't have historical activity logs in store yet)
  const weeklyData = [
    { day: 'Lun', ways: 2 },
    { day: 'Mar', ways: 5 },
    { day: 'Mie', ways: 3 },
    { day: 'Jue', ways: 8 },
    { day: 'Vie', ways: 4 },
    { day: 'Sab', ways: 1 },
    { day: 'Dom', ways: 6 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Module Mastery */}
      <div style={{ background: 'white', padding: 24, borderRadius: 24, border: '1.5px solid #F1F2FF' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1E1B4B', marginBottom: 20 }}>
          📊 Dominio por Área (%)
        </h3>
        <div style={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={masteryData} layout="vertical" margin={{ left: -20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F2FF" />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} 
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFF' }}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="pct" 
                radius={10} 
                barSize={32}
                background={{ fill: '#F8FAFF', radius: 10 }}
              >
                {masteryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Progress */}
      <div style={{ background: 'white', padding: 24, borderRadius: 24, border: '1.5px solid #F1F2FF' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1E1B4B', marginBottom: 20 }}>
          📈 Actividad Semanal (Retos)
        </h3>
        <div style={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorWays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.indigo} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.indigo} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2FF" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="ways" 
                stroke={C.indigo} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorWays)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
