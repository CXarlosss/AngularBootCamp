import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RadarEvolutionProps {
  data: any[];
}

export function RadarEvolution({ data }: RadarEvolutionProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar name="Promedio Centro" dataKey="avg" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.1} strokeDasharray="3 3" />
          <Radar name="Hace 1 mes" dataKey="past" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
          <Radar name="Sesión actual" dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
          
          <Tooltip 
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
