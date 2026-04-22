import React from 'react';
import { motion } from 'framer-motion';

const TYPES = [
  { id: 'double-choice', label: 'Doble Elección', icon: '🔘', desc: 'Elige entre 2 opciones' },
  { id: 'sequencing', label: 'Secuencia', icon: '🔢', desc: 'Ordena pasos' },
  { id: 'memory', label: 'Memoria', icon: '🧠', desc: 'Encuentra parejas' },
  { id: 'tracing', label: 'Trazado', icon: '✏️', desc: 'Arrastra y conecta' },
];

export const WayTypeSelector: React.FC<{
  selected: string;
  onSelect: (type: string) => void;
}> = ({ selected, onSelect }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 16, marginBottom: 32 }}>
      {TYPES.map((type) => {
        const isSelected = selected === type.id;
        return (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(type.id)}
            style={{
              padding: 20, borderRadius: 32, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              border: isSelected ? '4px solid #6366F1' : '4px solid white',
              background: isSelected ? '#EEF2FF' : 'white',
              boxShadow: isSelected ? '0 10px 25px rgba(99,102,241,0.2)' : '0 10px 25px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{type.icon}</div>
            <div style={{ fontWeight: 900, color: '#1E293B', fontSize: 12, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{type.label}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>{type.desc}</div>
          </motion.button>
        );
      })}
    </div>
  );
};
