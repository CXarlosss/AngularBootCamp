import React from 'react';
import { motion } from 'framer-motion';
import { TherapeuticObjective } from '../store/therapistStore';

const CATEGORY_COLORS = {
  autonomy: '#4F46E5', // Indigo
  social: '#F97316',    // Orange
  regulation: '#14B8A6', // Teal
  communication: '#7C3AED', // Violet
  persistence: '#10B981', // Emerald
};

const CATEGORY_ICONS = {
  autonomy: '⚡',
  social: '🤝',
  regulation: '🧘',
  communication: '🛡️',
  persistence: '💪',
};

interface ObjectiveCardProps {
  objective: TherapeuticObjective;
  onUpdate: (progress: number) => void;
  onDelete: () => void;
}

export function ObjectiveCard({ objective, onUpdate, onDelete }: ObjectiveCardProps) {
  const progress = Math.min(100, (objective.currentValue / objective.targetValue) * 100);
  const color = CATEGORY_COLORS[objective.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: 20,
        border: `1.5px solid #E8E9FF`,
        boxShadow: '0 4px 15px rgba(79,70,229,.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Category Tag */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '6px 12px',
        background: `${color}15`,
        color: color,
        fontSize: 10,
        fontWeight: 800,
        borderRadius: '0 0 0 12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {CATEGORY_ICONS[objective.category]} {objective.category}
      </div>

      <div>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1E1B4B' }}>{objective.title}</h4>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{objective.description}</p>
      </div>

      {/* Progress Section */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#4B5563' }}>
            {objective.currentValue} / {objective.targetValue} <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>{objective.unit}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: color }}>{Math.round(progress)}%</span>
        </div>
        
        <div style={{
          height: 10,
          background: '#F1F2FF',
          borderRadius: 5,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              height: '100%',
              background: color,
              borderRadius: 5,
              boxShadow: `0 0 10px ${color}40`
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {[1, 2, 5].map(inc => (
            <motion.button
              key={inc}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(objective.currentValue + inc)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: '#F1F2FF',
                color: '#4F46E5',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              +{inc}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(Math.max(0, objective.currentValue - 1))}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: 'none',
              background: '#F1F2FF',
              color: '#4F46E5',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            -1
          </motion.button>
        </div>

        <button
          onClick={onDelete}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#F43F5E',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
            opacity: 0.6
          }}
        >
          🗑️
        </button>
      </div>

      {objective.status === 'achieved' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            zIndex: 10
          }}
        >
          <span style={{ fontSize: 40 }}>🏆</span>
          <span style={{ fontWeight: 800, color: '#10B981', marginTop: 5 }}>¡LOGRADO!</span>
          <button
            onClick={onDelete}
            style={{
              marginTop: 10,
              padding: '6px 12px',
              borderRadius: 10,
              border: '1.5px solid #E8E9FF',
              background: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Archivar
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
