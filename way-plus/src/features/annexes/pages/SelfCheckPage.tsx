import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { format, startOfWeek, addDays } from 'date-fns';

const C = {
  indigo: '#4F46E5',
  indigoLight: '#E0E7FF',
  indigoDark: '#312E81',
  indigoMuted: '#C7D2FE',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  slate: '#64748B',
  slateDark: '#1E293B',
  slateLight: '#F1F5F9',
  white: '#ffffff',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TRACKABLE_ITEMS = [
  { id: 'relaxation', label: '🧘 Práctica de Relajación', category: 'base' },
  { id: 'autonomy', label: '🌟 Autonomía', category: 'base' },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `way-${i + 1}`,
    label: `Reto WAY ${i + 1}`,
    category: 'way' as const,
  })),
];

export const SelfCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { weeklyCheck, toggleWeeklyCheck, profile } = usePlayerStore();
  const [currentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.indigoLight}, #EEF2FF)`, padding: '24px 16px', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/annexes')}
            style={{ width: 48, height: 48, borderRadius: 16, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 12px rgba(79,70,229,0.15)', cursor: 'pointer', fontSize: 20, color: C.indigo }}
          >
            ←
          </motion.button>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.indigoDark, margin: 0 }}>Autocomprobación</h1>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.indigo, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Mi Diario Semanal</p>
          </div>
        </header>

        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.05)', border: '2px solid white', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: C.indigo, color: C.white }}>
                <th style={{ position: 'sticky', left: 0, zIndex: 10, background: C.indigo, padding: '24px', textAlign: 'left', fontSize: 18, fontWeight: 900, minWidth: 240, borderTopLeftRadius: 30, boxShadow: '4px 0 8px rgba(0,0,0,0.1)' }}>Actividad</th>
                {WEEK_DAYS.map((day, idx) => (
                  <th key={day} style={{ padding: '16px 8px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', minWidth: 80, ...(idx === 6 ? { borderTopRightRadius: 30 } : {}) }}>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 4 }}>{day.slice(0,3)}</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{format(weekDays[idx], 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRACKABLE_ITEMS.map((item, rowIdx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.05 }}
                  style={{ borderBottom: `1px solid ${C.indigoLight}`, background: item.category === 'base' ? 'rgba(224,231,255,0.3)' : 'transparent' }}
                >
                  <td style={{ position: 'sticky', left: 0, zIndex: 5, background: item.category === 'base' ? '#F4F6FF' : C.white, padding: '20px 24px', boxShadow: '4px 0 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 900, fontSize: item.category === 'base' ? 16 : 14, color: item.category === 'base' ? C.indigoDark : C.slate }}>
                        {item.label}
                      </span>
                      {item.category === 'way' && (
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: profile.completedWays.includes(item.id) ? C.indigo : '#9CA3AF', marginTop: 4 }}>
                          {profile.completedWays.includes(item.id) ? 'Desbloqueado' : 'Pendiente'}
                        </span>
                      )}
                    </div>
                  </td>
                  {weekDays.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isChecked = !!weeklyCheck[`${item.id}-${dateStr}`];
                    const isDesbloqueado = item.category === 'base' || profile.completedWays.includes(item.id);
                    
                    return (
                      <td key={dateStr} style={{ padding: 12, borderLeft: `1px solid ${C.indigoLight}` }}>
                        <motion.button
                          whileTap={isDesbloqueado ? { scale: 0.9 } : {}}
                          disabled={!isDesbloqueado}
                          onClick={() => {
                            toggleWeeklyCheck(item.id, dateStr);
                            if (!isChecked) {
                              useRewardsStore.getState().addCoins(5, 'weekly-check');
                            }
                          }}
                          style={{
                            width: '100%', minWidth: 44, aspectRatio: '1/1', borderRadius: 16, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isDesbloqueado ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                            background: isChecked ? C.emerald : isDesbloqueado ? C.white : C.slateLight,
                            color: isChecked ? C.white : isDesbloqueado ? C.indigoMuted : 'rgba(0,0,0,0)',
                            boxShadow: isChecked ? '0 4px 12px rgba(16,185,129,0.3)' : isDesbloqueado ? 'inset 0 0 0 2px #E0E7FF' : 'none'
                          }}
                        >
                          <span style={{ fontSize: 24, fontWeight: 900 }}>✓</span>
                        </motion.button>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: C.indigoDark, color: C.indigoLight, padding: 32, borderRadius: 32, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'center', boxShadow: '0 12px 32px rgba(49,46,129,0.2)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            ℹ️
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h4 style={{ fontSize: 20, fontWeight: 900, color: C.white, margin: '0 0 4px' }}>Guía de Autocomprobación</h4>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>Marca los retos que has conseguido realizar en la vida real durante el día. ¡Sincérate contigo mismo!</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, background: C.emerald, borderRadius: '50%' }} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Conseguido</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%' }} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Pendiente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
