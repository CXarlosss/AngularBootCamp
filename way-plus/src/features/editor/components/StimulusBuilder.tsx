import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  image: string;
  onTextChange: (text: string) => void;
  onImageChange: (url: string) => void;
}

export const StimulusBuilder: React.FC<Props> = ({ text, image, onTextChange, onImageChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(url);
  };

  return (
    <div style={{ background: 'white', borderRadius: 40, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '4px solid #F8FAFC', marginBottom: 32 }}>
      <h3 style={{ fontWeight: 900, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
        <span style={{ background: '#E0E7FF', color: '#4F46E5', padding: 8, borderRadius: 12 }}>🎯</span>
        Estímulo Visual y Enunciado
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Pictograma Principal</label>
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => fileRef.current?.click()}
            style={{
              aspectRatio: '1/1', borderRadius: 32, border: image ? '4px solid #A7F3D0' : '4px dashed #F1F5F9',
              background: image ? '#ECFDF5' : '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
            }}
          >
            {image ? (
              <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 24 }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
                <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Subir Pictograma</div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginTop: 4 }}>Formatos PNG, JPG, WEBP</div>
              </div>
            )}
          </motion.div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Pregunta o Consigna</label>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Ej: ¿Qué haces antes de comer?"
              style={{
                flex: 1, width: '100%', padding: 24, borderRadius: 32, border: '4px solid #F1F5F9',
                outline: 'none', fontSize: 20, fontWeight: 700, color: '#334155', resize: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <div style={{ background: '#FFFBEB', borderRadius: 24, padding: 24, borderBottom: '4px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E', fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              <span>💡</span> Consejo Clínico
            </div>
            <p style={{ fontSize: 14, color: '#B45309', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
              Usa lenguaje positivo y directo. Los pictogramas deben ser claros y sin distracciones de fondo para niños con TEA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
