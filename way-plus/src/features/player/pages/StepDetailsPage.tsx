import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { registry } from '@/content/registry';
import type { Step, Way } from '@/core/engine/types';

const C = {
  indigo:      '#4F46E5',
  indigoLight: '#E8E9FF',
  slate:       '#64748B',
  slateLight:  '#F1F5F9',
  slateDark:   '#1E293B',
  text:        '#1E1B4B',
  white:       '#ffffff',
  emerald:     '#10B981',
  amber:       '#F59E0B',
  rose:        '#F43F5E',
  purple:      '#8B5CF6',
};

const THEME_COLORS: Record<string, { bg: string; iconBg: string; text: string }> = {
  relaxation:    { bg: '#ECFDF5', iconBg: '#D1FAE5', text: '#065F46' },
  'self-esteem': { bg: '#F5F3FF', iconBg: '#EDE9FE', text: '#5B21B6' },
  assertiveness: { bg: '#FFF1F2', iconBg: '#FFE4E6', text: '#9F1239' },
  autonomy:      { bg: '#FFFBEB', iconBg: '#FEF3C7', text: '#92400E' },
  default:       { bg: '#F8FAFC', iconBg: '#F1F5F9', text: '#475569' },
};

export function StepDetailsPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stepId) return;
    setLoading(true);
    registry.getStepByIdAsync(stepId).then(res => {
      setStep(res);
      setLoading(false);
    });
  }, [stepId]);

  const completedWays = useMemo(() => new Set(profile.completedWays), [profile.completedWays]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.indigo, fontWeight: 700 }}>
        Cargando retos...
      </div>
    );
  }

  if (!step) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>No se encontró el módulo.</p>
        <button onClick={() => navigate('/')}>Volver</button>
      </div>
    );
  }

  const theme = THEME_COLORS[step.theme] || THEME_COLORS.default;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg,
      padding: '24px 16px 120px' 
    }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          style={{
            width: 48, height: 48, borderRadius: 16,
            background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            cursor: 'pointer', fontSize: 20, color: C.indigo
          }}
        >
          ←
        </motion.button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>{step.title}</h1>
          <p style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: 0, opacity: 0.7 }}>
            Selecciona un WAY para jugar
          </p>
        </div>
      </header>

      {/* Ways List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {step.ways.map((way, idx) => {
          const isCompleted = completedWays.has(way.id);
          const isUrl = way.stimulus?.image && (way.stimulus.image.includes('/') || way.stimulus.image.startsWith('http') || way.stimulus.image.startsWith('data:'));

          return (
            <motion.div
              key={way.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/play/${profile.currentLevel}/${step.id}/${way.id}`)}
              style={{
                background: C.white,
                borderRadius: 24,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
                border: isCompleted ? `2px solid ${C.emerald}22` : `2px solid transparent`,
                opacity: isCompleted ? 0.8 : 1,
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: isCompleted ? C.emerald : theme.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, color: isCompleted ? C.white : theme.text,
                fontWeight: 900
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                  WAY {idx + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>
                  {way.metadata.skillTag.split('.').pop()?.toUpperCase() || 'RETO'}
                </div>
              </div>

              {way.stimulus?.image && (
                <div style={{ width: 40, height: 40, opacity: 0.5 }}>
                   {isUrl ? (
                    <img src={way.stimulus.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 24 }}>{way.stimulus.image}</span>
                  )}
                </div>
              )}

              {isCompleted && (
                 <div style={{ 
                   position: 'absolute', top: 12, right: 12,
                   background: C.emerald, color: '#fff', 
                   fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 8
                 }}>
                   COMPLETADO
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Step Progress Footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        padding: '20px 16px 40px',
        borderTop: `1px solid ${C.indigoLight}`,
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: C.text }}>
          <span>PROGRESO DEL MÓDULO</span>
          <span>{Array.from(completedWays).filter(id => step.ways.some(w => w.id === id)).length}/{step.ways.length}</span>
        </div>
        <div style={{ height: 10, background: C.slateLight, borderRadius: 5, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(Array.from(completedWays).filter(id => step.ways.some(w => w.id === id)).length / step.ways.length) * 100}%` }}
            style={{ height: '100%', background: C.emerald, borderRadius: 5 }}
          />
        </div>
      </div>
    </div>
  );
}
