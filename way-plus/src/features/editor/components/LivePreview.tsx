import React from 'react';
import { motion } from 'framer-motion';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import type { DraftWay } from '../hooks/useWayBuilder';

export const LivePreview: React.FC<{ draft: DraftWay }> = ({ draft }) => {
  const mockWay = {
    ...draft,
    id: 'preview',
  };

  const hasContent = draft.stimulus.image || draft.options.length > 0;

  return (
    <div style={{ background: '#0F172A', borderRadius: 48, padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'sticky', top: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>
          <span style={{ background: '#FBBF24', color: 'white', width: 32, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👁️</span>
          Vista Previa Clínica
        </h3>
        <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: 9999, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          Tiempo Real
        </span>
      </div>
      
      <div style={{ background: '#1E293B', borderRadius: 32, overflow: 'hidden', minHeight: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '4px solid rgba(51, 65, 85, 0.5)', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)' }}>
        {hasContent ? (
          <div style={{ width: '100%', transform: 'scale(0.8)', transformOrigin: 'center', opacity: 0.9, pointerEvents: 'none' }}>
            <WayRenderer way={mockWay as any} onComplete={() => {}} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 24, filter: 'grayscale(100%)', opacity: 0.5 }}>🎨</div>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: '0 0 8px 0' }}>Empieza a diseñar</p>
            <p style={{ color: '#94A3B8', fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.5 }}>Configura el estímulo y las opciones<br/>para ver el resultado final.</p>
          </div>
        )}
        
        {/* Overlay indicativo de preview */}
        <div style={{ position: 'absolute', inset: 0, border: '16px solid rgba(15, 23, 42, 0.1)', pointerEvents: 'none', borderRadius: 32, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)' }}></div>
      </div>
      
      <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 10, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
          Esta es la interfaz exacta que el niño verá en la aplicación.<br/>El motor adaptativo se ajustará según su progreso histórico.
        </p>
      </div>
    </div>
  );
};
