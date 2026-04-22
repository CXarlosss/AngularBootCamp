import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: string;
  image: string;
  label: string;
  isCorrect: boolean;
  order?: number;
}

interface Props {
  options: Option[];
  onChange: (options: Option[]) => void;
  type: string;
}

export const OptionBuilder: React.FC<Props> = ({ options, onChange, type }) => {
  const addOption = () => {
    if (options.length >= 6) return;
    onChange([
      ...options,
      { 
        id: `opt-${Date.now()}`, 
        image: '', 
        label: '', 
        isCorrect: false,
        order: options.length
      },
    ]);
  };

  const updateOption = (index: number, updates: Partial<Option>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div style={{ background: 'white', borderRadius: 40, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '4px solid #F8FAFC', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h3 style={{ fontWeight: 900, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>
          <span style={{ background: '#D1FAE5', color: '#059669', padding: 8, borderRadius: 12 }}>🔘</span>
          Configurar Opciones
        </h3>
        <div style={{ background: '#F1F5F9', padding: '4px 16px', borderRadius: 9999, fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2 }}>
          {options.length} / 6 Opciones
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
        <AnimatePresence>
          {options.map((opt, idx) => (
            <motion.div
              key={opt.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                borderRadius: 24, padding: 20, position: 'relative', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: opt.isCorrect ? '4px solid #10B981' : '4px solid #F1F5F9',
                background: opt.isCorrect ? '#ECFDF5' : 'white',
              }}
            >
              <div style={{ position: 'absolute', top: -12, right: -12, display: 'flex', gap: 8, zIndex: 10 }}>
                <button
                  onClick={() => updateOption(idx, { isCorrect: !opt.isCorrect })}
                  style={{
                    width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    background: opt.isCorrect ? '#10B981' : 'white',
                    color: opt.isCorrect ? 'white' : '#CBD5E1',
                    border: opt.isCorrect ? '2px solid white' : '2px solid #F1F5F9',
                  }}
                  title="Marcar como correcta"
                >
                  ✓
                </button>
                <button
                  onClick={() => removeOption(idx)}
                  style={{
                    width: 40, height: 40, borderRadius: 16, background: 'white', color: '#F43F5E', border: '2px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  ✕
                </button>
              </div>

              <div 
                style={{
                  aspectRatio: '16/9', background: '#F8FAFC', borderRadius: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', border: '2px dashed #E2E8F0', transition: 'all 0.2s'
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) updateOption(idx, { image: URL.createObjectURL(file) });
                  };
                  input.click();
                }}
              >
                {opt.image ? (
                  <img src={opt.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 24, marginBottom: 4, display: 'block' }}>🖼️</span>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Pictograma</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {type === 'sequencing' && (
                  <div style={{ width: 48 }}>
                    <input
                      type="number"
                      value={opt.order}
                      onChange={(e) => updateOption(idx, { order: Number(e.target.value) })}
                      style={{
                        width: '100%', padding: 8, borderRadius: 12, border: '2px solid #F1F5F9', textAlign: 'center', fontWeight: 900, color: '#4F46E5',
                        outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box'
                      }}
                      placeholder="#"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, { label: e.target.value })}
                  placeholder="Nombre de la opción"
                  style={{
                    flex: 1, width: '100%', padding: 12, borderRadius: 12, border: '2px solid #F1F5F9', fontWeight: 700, color: '#334155', fontSize: 14,
                    outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {options.length < 6 && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={addOption}
          style={{
            marginTop: 32, width: '100%', padding: '20px 0', borderRadius: 32, border: '4px dashed #E2E8F0', color: '#94A3B8', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: 2, cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(248, 250, 252, 0.5)'
          }}
        >
          + Añadir Opción Nueva
        </motion.button>
      )}
    </div>
  );
};
