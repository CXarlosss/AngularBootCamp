import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddObjectiveModalProps {
  onClose: () => void;
  onAdd: (obj: {
    title: string;
    description: string;
    category: any;
    targetValue: number;
    currentValue: number;
    unit: string;
  }) => void;
}

export function AddObjectiveModal({ onClose, onAdd }: AddObjectiveModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'autonomy',
    targetValue: 10,
    currentValue: 0,
    unit: 'sesiones'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    onAdd(form);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 450,
          padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E1B4B' }}>🎯 Nuevo Objetivo</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>TÍTULO DEL OBJETIVO</label>
            <input
              autoFocus
              type="text"
              placeholder="Ej: Saludar al entrar"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8E9FF',
                fontSize: 15, outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>DESCRIPCIÓN / CRITERIO</label>
            <textarea
              placeholder="Detalles sobre cómo medir el éxito..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8E9FF',
                fontSize: 14, outline: 'none', minHeight: 80, resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>CATEGORÍA</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8E9FF',
                  fontSize: 14, outline: 'none', background: '#fff'
                }}
              >
                <option value="autonomy">Autonomía</option>
                <option value="social">Social</option>
                <option value="regulation">Regulación</option>
                <option value="communication">Comunicación</option>
                <option value="persistence">Persistencia</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>UNIDAD</label>
              <input
                type="text"
                placeholder="veces, %, días..."
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8E9FF',
                  fontSize: 14, outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>META (VALOR OBJETIVO)</label>
            <input
              type="number"
              value={form.targetValue}
              onChange={e => setForm({ ...form, targetValue: parseInt(e.target.value) || 0 })}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8E9FF',
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={{
              marginTop: 10, padding: '14px', borderRadius: 16, border: 'none',
              background: '#4F46E5', color: '#fff', fontWeight: 800, fontSize: 15,
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
            }}
          >
            Crear Objetivo
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
