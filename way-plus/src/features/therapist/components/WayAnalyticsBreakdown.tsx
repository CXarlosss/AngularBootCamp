import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsService, type WayMetrics } from '@/core/services/analyticsService';

const COLORS = {
  indigo: '#4F46E5',
  rose: '#F43F5E',
  amber: '#F59E0B',
  emerald: '#10B981',
  text: '#1E1B4B',
  muted: '#64748B',
  bg: '#F8FAFF'
};

export function WayAnalyticsBreakdown({ patientId }: { patientId: string }) {
  const [metrics, setMetrics] = useState<WayMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await analyticsService.getWayBreakdown(patientId);
        setMetrics(data);
      } catch (e) {
        console.error('Error loading way breakdown:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  if (loading) return <div style={{ padding: 20, color: COLORS.indigo }}>Cargando desglose detallado...</div>;
  if (metrics.length === 0) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🕵️</span> Análisis Detallado por Way
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {metrics.map((m) => {
          const isHighEffort = m.avgAttempts > 2.5 || m.avgTimeSec > 60;
          
          return (
            <motion.div
              key={m.wayId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '16px 20px',
                border: `1.5px solid ${isHighEffort ? COLORS.rose : '#F1F2FF'}`,
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                alignItems: 'center',
                gap: 16,
                boxShadow: isHighEffort ? '0 4px 12px rgba(244, 63, 94, 0.08)' : 'none'
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{m.wayId}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{m.category} · Última: {new Date(m.lastPlayed).toLocaleDateString()}</div>
              </div>

              <MetricValue 
                label="Intentos (Media)" 
                value={m.avgAttempts} 
                color={m.avgAttempts > 2.5 ? COLORS.rose : COLORS.text}
                alert={m.avgAttempts > 2.5}
              />

              <MetricValue 
                label="Tiempo (Media)" 
                value={`${m.avgTimeSec}s`} 
                color={m.avgTimeSec > 60 ? COLORS.amber : COLORS.text}
                alert={m.avgTimeSec > 60}
              />

              <MetricValue 
                label="Completados" 
                value={m.completions} 
                color={COLORS.emerald}
              />
            </motion.div>
          );
        })}
      </div>

      {metrics.some(m => m.avgAttempts > 2.5 || m.avgTimeSec > 60) && (
        <div style={{ 
          marginTop: 20, padding: 16, borderRadius: 12, background: '#FFF1F2', 
          border: `1px solid ${COLORS.rose}`, color: COLORS.rose, fontSize: 13, fontWeight: 600,
          display: 'flex', gap: 10, alignItems: 'center'
        }}>
          <span>⚠️</span> Se han detectado Ways con dificultad inusualmente alta para este paciente. Considera ajustar el scaffolding.
        </div>
      )}
    </div>
  );
}

function MetricValue({ label, value, color, alert }: { label: string, value: string | number, color: string, alert?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {value}
        {alert && <span style={{ fontSize: 12 }}>🚩</span>}
      </div>
    </div>
  );
}
