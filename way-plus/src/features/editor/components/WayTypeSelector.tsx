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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {TYPES.map((type) => (
        <motion.button
          key={type.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(type.id)}
          className={`p-5 rounded-[2rem] border-4 text-left transition-all shadow-lg
            ${selected === type.id 
              ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100' 
              : 'border-white bg-white hover:border-indigo-100'
            }`}
        >
          <div className="text-4xl mb-3">{type.icon}</div>
          <div className="font-black text-slate-800 text-sm uppercase tracking-tight">{type.label}</div>
          <div className="text-xs text-slate-400 font-bold mt-1 leading-tight">{type.desc}</div>
        </motion.button>
      ))}
    </div>
  );
};
