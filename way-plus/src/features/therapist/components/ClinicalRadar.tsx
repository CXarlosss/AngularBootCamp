import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  calculateCompetencies, 
  detectImbalances, 
  getProfileLabel, 
  COMPETENCY_LABELS, 
  COMPETENCY_ICONS,
  type CompetencyScores
} from '../utils/clinicalRadarUtils';
import './ClinicalRadar.css';

interface ClinicalRadarProps {
  completedWays: string[];
  relaxationLog: Record<string, any>;
  roleplayLog: Record<string, any>;
  streakDays: number;
  totalXp: number;
  previousScores?: CompetencyScores;
  patientName: string;
}

export const ClinicalRadar: React.FC<ClinicalRadarProps> = ({
  completedWays,
  relaxationLog,
  roleplayLog,
  streakDays,
  totalXp,
  previousScores,
  patientName
}) => {
  const scores = useMemo(() => 
    calculateCompetencies({ completedWays, relaxationLog, roleplayLog, streakDays, totalXp }),
  [completedWays, relaxationLog, roleplayLog, streakDays, totalXp]);

  const imbalances = useMemo(() => detectImbalances(scores), [scores]);
  const profileLabel = useMemo(() => getProfileLabel(scores), [scores]);

  // SVG Radar Constants
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / 5;

  const points = (s: CompetencyScores) => {
    const keys: (keyof CompetencyScores)[] = ['autonomy', 'assertiveness', 'regulation', 'social', 'persistence'];
    return keys.map((key, i) => {
      const val = s[key] / 100;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * val * Math.cos(angle);
      const y = center + radius * val * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="radar-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1E1B4B' }}>
            🕸️ Radar de Competencias
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            {patientName} — Perfil Clínico Actual
          </p>
        </div>
        <div style={{ 
          background: '#4F46E5', color: 'white', padding: '6px 12px', 
          borderRadius: 12, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' 
        }}>
          {profileLabel}
        </div>
      </div>

      <div className="radar-chart-wrapper">
        <svg width={size} height={size} className="radar-svg">
          {/* Background Grid */}
          {gridLevels.map(level => (
            <polygon
              key={level}
              className="radar-polygon-base"
              points={points({
                autonomy: level * 100,
                assertiveness: level * 100,
                regulation: level * 100,
                social: level * 100,
                persistence: level * 100
              })}
            />
          ))}

          {/* Axes */}
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const labelX = center + (radius + 25) * Math.cos(angle);
            const labelY = center + (radius + 25) * Math.sin(angle);
            const keys: (keyof CompetencyScores)[] = ['autonomy', 'assertiveness', 'regulation', 'social', 'persistence'];
            
            return (
              <g key={i}>
                <line x1={center} y1={center} x2={x} y2={y} className="radar-axis" />
                <text 
                  x={labelX} 
                  y={labelY} 
                  className="radar-label" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                >
                  {COMPETENCY_ICONS[keys[i]]}
                </text>
              </g>
            );
          })}

          {/* Previous Scores (Dashed) */}
          {previousScores && (
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="radar-polygon-prev"
              points={points(previousScores)}
            />
          )}

          {/* Current Data Polygon */}
          <motion.polygon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="radar-polygon-data"
            points={points(scores)}
          />
        </svg>
      </div>

      <div className="competency-cards-grid">
        {(Object.entries(scores) as [keyof CompetencyScores, number][]).map(([key, val]) => (
          <div key={key} className="competency-card">
            <span className="competency-icon">{COMPETENCY_ICONS[key]}</span>
            <span className="competency-value">{val}</span>
            <span className="competency-name">{COMPETENCY_LABELS[key]}</span>
          </div>
        ))}
      </div>

      {imbalances.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {imbalances.map((imb, i) => (
            <div key={i} className={`imbalance-alert ${imb.type}`}>
              <span>{imb.type === 'danger' ? '🚨' : '⚠️'}</span>
              <span>{imb.message}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: 8, padding: 16, borderRadius: 16, background: '#F8FAFF', 
        border: '1.5px solid #E8E9FF', fontSize: 13, color: '#475569', lineHeight: 1.5 
      }}>
        <div style={{ fontWeight: 800, color: '#1E1B4B', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          💡 Recomendación Clínica
        </div>
        {imbalances.length > 0 
          ? `Se recomienda priorizar actividades en el área de ${imbalances[0].areaB} para equilibrar el desarrollo competencial.`
          : `El desarrollo es equilibrado. Continuar con el plan actual fomentando la ${Object.entries(scores).sort((a,b) => a[1]-b[1])[0][1]} como siguiente reto.`}
      </div>
    </div>
  );
};
