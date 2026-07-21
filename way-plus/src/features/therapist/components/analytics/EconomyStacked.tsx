import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EconomyStackedProps {
  data: any[];
}

export function EconomyStacked({ data }: EconomyStackedProps) {
  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#4b5563', paddingTop: 10 }} />
          <Bar dataKey="ingresos" stackId="a" fill="#10b981" name="Ingresos (Monedas)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="gastos" stackId="a" fill="#f43f5e" name="Gastos (Tienda)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
