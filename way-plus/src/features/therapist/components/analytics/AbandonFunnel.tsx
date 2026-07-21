import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AbandonFunnelProps {
  data: any[];
}

export function AbandonFunnel({ data }: AbandonFunnelProps) {
  // Colores degradados para simular el funnel
  const colors = ['#818cf8', '#6366f1', '#4338ca'];

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} />
          <Tooltip 
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
