import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { registry } from '@/content/registry';
import type { Step } from '@/core/engine/types';

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

export function LevelSelectPage() {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    registry.getStepsForLevel(profile.currentLevel).then(res => {
      setSteps(res);
      setLoading(false);
    });
  }, [profile.currentLevel]);

  const uniqueSteps = useMemo(() => {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    
    return steps.filter((step: Step) => {
      // Deduplicate by ID and Title (to prevent cloud vs local duplicates)
      const titleKey = step.title.trim().toLowerCase();
      if (seenIds.has(step.id) || seenTitles.has(titleKey)) return false;
      
      seenIds.add(step.id);
      seenTitles.add(titleKey);
      return true;
    });
  }, [steps]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.indigo, fontWeight: 700 }}>
        Cargando módulos...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Welcome Card */}
      <header style={{
        background: 'linear-gradient(135deg, #E0E7FF, #EEF2FF)',
        borderRadius: 32,
        padding: 24,
        boxShadow: '0 4px 20px rgba(79,70,229,0.08)',
        border: '1px solid #fff'
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.indigo, marginBottom: 4 }}>
          ¡Hola! 👋
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.5px', marginBottom: 8 }}>
          ¿Listo para jugar hoy?
        </h1>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 12 }}>
          Progreso {profile.currentLevel.toUpperCase()} — {profile.completedWays.length} WAYS
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '20%' }}
            style={{ height: '100%', background: C.indigo, borderRadius: 4 }}
          />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 12, fontWeight: 800, color: C.slate, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Módulos {profile.currentLevel.toUpperCase()}
        </h2>
        
        {uniqueSteps.map((step: Step) => {
          const theme = THEME_COLORS[step.theme] || THEME_COLORS.default;
          const pictoRaw = step.ways[0]?.stimulus?.image;
          const isUrl = pictoRaw && (pictoRaw.includes('/') || pictoRaw.startsWith('http') || pictoRaw.startsWith('data:'));

          return (
            <motion.div
              key={step.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (step.ways.length > 0) {
                  navigate(`/play/${profile.currentLevel}/${step.id}/${step.ways[0].id}`);
                }
              }}
              style={{
                background: theme.bg,
                borderRadius: 32,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                border: `1.5px solid ${theme.iconBg}`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, boxShadow: `0 4px 12px rgba(0,0,0,0.05)`,
                  border: `2px solid ${theme.iconBg}`,
                  overflow: 'hidden'
                }}>
                  {isUrl ? (
                    <img src={pictoRaw} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                  ) : (
                    pictoRaw || '✨'
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, fontWeight: 500, color: theme.text, margin: '2px 0 0', opacity: 0.8 }}>
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, position: 'relative', zIndex: 1 }}>
                <div style={{ width: '0%', height: '100%', background: theme.text, borderRadius: 3, opacity: 0.3 }} />
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, opacity: 0.6, position: 'relative', zIndex: 1 }}>
                0/{step.ways.length} WAYS · 0%
              </div>

              {/* Decorative background circle */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 120, height: 120,
                background: theme.iconBg,
                borderRadius: '50%',
                opacity: 0.4,
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
