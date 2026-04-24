import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/core/hooks/useAudio';
import { AmbientZone } from '@/core/utils/audioService';
import { ArrowLeft, Wind, Droplets, TreePine, Waves } from 'lucide-react';

const ZEN_OPTIONS = [
  { id: 'zen',        label: 'Lluvia',    icon: <Droplets size={32} />,  color: '#60A5FA' },
  { id: 'zen-forest', label: 'Bosque',    icon: <TreePine size={32} />,  color: '#34D399' },
  { id: 'zen-waves',  label: 'Mar',       icon: <Waves size={32} />,     color: '#2DD4BF' },
  { id: 'zen-wind',   label: 'Viento',    icon: <Wind size={32} />,      color: '#94A3B8' },
] as const;

export function ZenModePage() {
  const navigate = useNavigate();
  const { playAmbient, playSFX } = useAudio();
  const [activeZone, setActiveZone] = useState<AmbientZone>('none');

  const handleSelect = (id: AmbientZone) => {
    playSFX('click');
    if (activeZone === id) {
      setActiveZone('none');
      playAmbient('none');
    } else {
      setActiveZone(id);
      playAmbient(id);
    }
  };

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: '#0F172A', 
      padding: '24px 16px 100px',
      color: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSFX('click'); navigate(-1); }}
          style={{
            width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Modo Zen</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Encuentra tu momento de calma</p>
        </div>
      </header>

      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', gap: 40 
      }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <AnimatePresence>
            {activeZone !== 'none' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: ZEN_OPTIONS.find(o => o.id === activeZone)?.color || 'white'
                }}
              />
            )}
          </AnimatePresence>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64
          }}>
            {activeZone === 'none' ? '🧘' : ZEN_OPTIONS.find(o => o.id === activeZone)?.icon}
          </div>
        </div>

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 16, width: '100%', maxWidth: 320 
        }}>
          {ZEN_OPTIONS.map(opt => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(opt.id)}
              style={{
                padding: 24, borderRadius: 24, border: '2px solid',
                borderColor: activeZone === opt.id ? opt.color : 'rgba(255,255,255,0.05)',
                background: activeZone === opt.id ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                color: activeZone === opt.id ? opt.color : '#F8FAFC',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              <div style={{ opacity: activeZone === opt.id ? 1 : 0.5 }}>{opt.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: 20 }}>
        <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
          Cierra los ojos y respira profundamente...
        </p>
      </div>
    </div>
  );
}
