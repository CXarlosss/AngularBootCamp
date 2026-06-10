import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/core/services/supabaseClient';
import { useStreakDays } from '@/features/player/hooks/useStreakDays';
import { WayAnalyticsBreakdown } from './WayAnalyticsBreakdown';

interface AnalyticsData {
  totalCompletions: number;
  avgAttempts: number;
  abandonRate: number;
  categoryDistribution: Record<string, number>;
  sessions: any[];
}

const COLORS = {
  indigo: '#4F46E5',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  bg: '#F8FAFF',
  card: '#FFFFFF',
  text: '#1E1B4B'
};

export function PatientAnalyticsView({ patientId }: { patientId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const streak = useStreakDays(patientId);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        // 1. Obtener logs de actividad
        if (!supabase) throw new Error('Supabase no disponible');
        const { data: logs, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Procesar métricas
        const completed = logs.filter(l => l.action === 'way_completed');
        const started = logs.filter(l => l.action === 'way_started');
        const abandoned = logs.filter(l => l.action === 'way_abandoned');

        const totalAttempts = completed.reduce((acc, l) => acc + (l.attempts || 1), 0);
        
        // Simulación de categorías (esto se mejorará con un join real en el futuro)
        const categories: Record<string, number> = {};
        completed.forEach(l => {
          const cat = l.metadata?.category || 'General';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        // 3. Obtener historial de sesiones agrupadas
        const { analyticsService } = await import('@/core/services/analyticsService');
        const sessions = await analyticsService.getSessionHistory(patientId);

        setData({
          totalCompletions: completed.length,
          avgAttempts: completed.length > 0 ? Number((totalAttempts / completed.length).toFixed(1)) : 0,
          abandonRate: started.length > 0 ? Number(((abandoned.length / started.length) * 100).toFixed(0)) : 0,
          categoryDistribution: categories,
          sessions: sessions
        });
      } catch (e) {
        console.error('[Analytics] Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [patientId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: COLORS.indigo }}>Analizando datos clínicos...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>No hay actividad registrada aún.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, padding: '10px 0' }}>
      
      {/* Widget: Racha Real */}
      <Card title="Compromiso (Streak)" icon="🔥" color={COLORS.amber}>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.amber }}>{streak} días</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Uso consecutivo detectado</div>
      </Card>

      {/* Widget: Intentos Promedio */}
      <Card title="Nivel de Dificultad" icon="📊" color={COLORS.indigo}>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.indigo }}>{data.avgAttempts}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Intentos por Way (Media)</div>
      </Card>

      {/* Widget: Tasa de Abandono */}
      <Card title="Frustración Detectada" icon="⚠️" color={COLORS.rose}>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.rose }}>{data.abandonRate}%</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>De sesiones no finalizadas</div>
      </Card>

      {/* Widget: Total Completados */}
      <Card title="Logros Totales" icon="✅" color={COLORS.emerald}>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.emerald }}>{data.totalCompletions}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Retos finalizados con éxito</div>
      </Card>

      {/* Historial de Sesiones */}
      <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Historial de Sesiones Clínicas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.sessions.slice(0, 5).map((session, i) => (
            <div key={session.id || i} style={{ border: `1px solid ${COLORS.bg}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📅</span> {session.title}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', background: COLORS.bg, padding: '4px 12px', borderRadius: 12 }}>
                  {session.timeRange} ({session.durationMin} min)
                </div>
              </div>
              
              <div style={{ marginLeft: 28, borderLeft: `2px solid ${COLORS.bg}`, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {session.logs.map((log: any, idx: number) => (
                  <div key={idx} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: COLORS.emerald }}>●</span> 
                    {log.way_id} <span style={{ color: '#6B7280' }}>(completado, {Math.round(((log.metadata?.durationSeconds || 0) / 60)) || 1} min)</span>
                  </div>
                ))}
                {session.logs.length === 0 && (
                  <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Sesión sin retos completados.</div>
                )}
              </div>

              <div style={{ marginTop: 12, marginLeft: 28, padding: '8px 12px', background: COLORS.bg, borderRadius: 8, fontSize: 12, color: COLORS.text, display: 'flex', gap: 16 }}>
                <span><strong>{session.logs.length}</strong> Ways</span>
                <span style={{ color: COLORS.amber }}><strong>{session.wayCoins}</strong> WayCoins</span>
                <span style={{ color: session.abandoned > 0 ? COLORS.rose : '#6B7280' }}><strong>{session.abandoned}</strong> abandonos</span>
              </div>
            </div>
          ))}
          {data.sessions.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: 20 }}>No hay sesiones registradas.</div>
          )}
        </div>
      </div>

      {/* Desglose Detallado por Way */}
      <div style={{ gridColumn: '1 / -1' }}>
        <WayAnalyticsBreakdown patientId={patientId} />
      </div>
    </div>
  );
}

function Card({ title, icon, color, children }: { title: string, icon: string, color: string, children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderBottom: `4px solid ${color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}
