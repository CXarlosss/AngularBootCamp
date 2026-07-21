import React, { useState } from 'react';
import { useSimulatedData, type PatientProfile } from '../hooks/useSimulatedData';
import { RadarEvolution } from './analytics/RadarEvolution';
import { ProgressCurve } from './analytics/ProgressCurve';
import { ActivityHeatmap } from './analytics/ActivityHeatmap';
import { EconomyStacked } from './analytics/EconomyStacked';
import { AbandonFunnel } from './analytics/AbandonFunnel';
import { ExportReportModal } from './ExportReportModal';

const COLORS = {
  indigo: '#4F46E5',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  bg: '#F8FAFF',
  card: '#FFFFFF',
  text: '#1E1B4B',
  muted: '#6B7280'
};

export function PatientAnalyticsView({ patientId }: { patientId: string }) {
  // Selector temporal para demo
  const [profile, setProfile] = useState<PatientProfile>('carlos');
  const data = useSimulatedData(profile);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
      
      {/* Selector de Perfil (Solo Demo) */}
      <div style={{ background: COLORS.bg, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 800, color: COLORS.text, fontSize: 14 }}>🧪 Simular Perfil:</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['carlos', 'ana', 'lucas'] as PatientProfile[]).map(p => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                background: profile === p ? COLORS.indigo : 'white',
                color: profile === p ? 'white' : COLORS.text,
                boxShadow: profile === p ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER DASHBOARD */}
      <div style={{ background: 'white', borderRadius: 20, padding: 24, border: `1.5px solid ${COLORS.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, margin: 0 }}>📊 Dashboard de {data.name}</h2>
          <p style={{ color: COLORS.muted, fontWeight: 600, fontSize: 14, margin: '4px 0 0 0' }}>Última sesión: {data.lastSession}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#FEF3C7', color: '#B45309', padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔥</span> Racha: {data.racha} días
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            style={{
              background: COLORS.indigo,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
          >
            📄 Descargar Informe
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        
        {/* RADAR */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: `1.5px solid ${COLORS.bg}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Radar de Competencias</h3>
          <RadarEvolution data={data.radar} />
        </div>

        {/* CURVA DE PROGRESO */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: `1.5px solid ${COLORS.bg}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Curva de Progreso (8 semanas)</h3>
          <ProgressCurve data={data.progress} />
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        
        {/* MAPA DE CALOR */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: `1.5px solid ${COLORS.bg}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Mapa de Calor de Actividad</h3>
          <ActivityHeatmap data={data.heatmap} />
        </div>

        {/* ECONOMÍA EMOCIONAL */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: `1.5px solid ${COLORS.bg}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Economía Emocional</h3>
          <EconomyStacked data={data.economy} />
        </div>

      </div>

      {/* FUNNEL DE ABANDONO */}
      <div style={{ background: 'white', borderRadius: 20, padding: 20, border: `1.5px solid ${COLORS.bg}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, margin: 0 }}>Funnel de Abandono</h3>
          {profile === 'lucas' && (
            <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
              ⚠️ Revisar: Tasa de abandono crítica (60%)
            </span>
          )}
        </div>
        <AbandonFunnel data={data.funnel} />
      </div>

      <ExportReportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        patientData={data as any} 
      />
    </div>
  );
}

