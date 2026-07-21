import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProgressCurveProps {
  data: any[];
}

export function ProgressCurve({ data }: ProgressCurveProps) {
  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWays" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis yAxisId="right" orientation="right" hide />
          <Tooltip 
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#4b5563', paddingTop: 10 }} />
          <Area yAxisId="left" type="monotone" name="XP Acumulado" dataKey="xp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
          <Area yAxisId="right" type="monotone" name="WAYs Completados" dataKey="ways" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWays)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
