import React, { useState } from 'react';
import { ClinicalAnnex, SelfCheckContent } from '../../types/clinicalAnnex';
import { updateAnnexContent } from '../../services/clinicalAnnexService';
import { downloadAnnexPDF } from '../../services/pdfExportService';
import { motion } from 'framer-motion';

interface Props {
  annex: ClinicalAnnex;
  onClose: () => void;
  patientName: string;
}

const BEHAVIORS = [
  'Autonomía en elecciones',
  'Expresión de emociones',
  'Seguimiento de instrucciones',
  'Interacción social espontánea',
  'Manejo de frustración',
];

const LEVELS = [
  { value: 1, label: 'Muy difícil', color: '#e53935' },
  { value: 2, label: 'Difícil', color: '#fb8c00' },
  { value: 3, label: 'Regular', color: '#fdd835' },
  { value: 4, label: 'Bien', color: '#7cb342' },
  { value: 5, label: 'Muy bien', color: '#43a047' },
];

export function SelfCheckAnnexForm({ annex, onClose, patientName }: Props) {
  const [content, setContent] = useState<SelfCheckContent>(annex.content as SelfCheckContent || {});
  const [saving, setSaving] = useState(false);

  async function handleSave(completed = false) {
    setSaving(true);
    await updateAnnexContent(annex.id, content, completed ? 'completed' : 'draft');
    setSaving(false);
    if (completed) onClose();
  }

  function toggleBehavior(b: string) {
    const current = content.observedBehaviors || [];
    const updated = current.includes(b)
      ? current.filter(x => x !== b)
      : [...current, b];
    setContent({ ...content, observedBehaviors: updated });
  }

  return (
    <div style={overlayStyle}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🪞 Registro de Autocomprobación</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Cerrar">✕</button>
        </div>

        {/* Escala pictográfica */}
        <div style={{ marginBottom: '24px' }}>
          <span style={labelStyle}>Autoevaluación del niño (escala 1-5)</span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'space-between' }}>
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setContent({ ...content, selfEvaluationLevel: l.value as 1|2|3|4|5 })}
                style={{
                  flex: 1,
                  padding: '16px 8px',
                  borderRadius: '14px',
                  border: '3px solid',
                  borderColor: content.selfEvaluationLevel === l.value ? l.color : '#eee',
                  backgroundColor: content.selfEvaluationLevel === l.value ? l.color + '20' : '#fff',
                  color: content.selfEvaluationLevel === l.value ? l.color : '#666',
                  fontFamily: 'Verdana',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-pressed={content.selfEvaluationLevel === l.value}
              >
                <span style={{ fontSize: '28px' }}>{l.value}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comportamientos observados */}
        <div style={{ marginBottom: '24px' }}>
          <span style={labelStyle}>Comportamientos observados esta semana</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {BEHAVIORS.map(b => (
              <label
                key={b}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: content.observedBehaviors?.includes(b) ? '#7B68EE' : '#eee',
                  backgroundColor: content.observedBehaviors?.includes(b) ? '#f3e5f5' : '#fff',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                <input
                  type="checkbox"
                  checked={content.observedBehaviors?.includes(b) || false}
                  onChange={() => toggleBehavior(b)}
                  style={{ width: '24px', height: '24px', accentColor: '#7B68EE' }}
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label htmlFor="sc-notes" style={labelStyle}>Notas del terapeuta</label>
          <textarea
            id="sc-notes"
            rows={4}
            value={content.therapistNotes || ''}
            onChange={e => setContent({ ...content, therapistNotes: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
          <button onClick={() => downloadAnnexPDF(annex, patientName)} style={{ ...actionButtonStyle, backgroundColor: '#f5f5f5', color: '#333' }}>
            📄 Exportar PDF
          </button>
          <button onClick={() => handleSave(false)} disabled={saving} style={{ ...actionButtonStyle, backgroundColor: '#ffc107', color: '#333' }}>
            {saving ? 'Guardando...' : '💾 Guardar borrador'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} style={{ ...actionButtonStyle, backgroundColor: '#4caf50', color: 'white' }}>
            ✅ Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Reutilizamos los estilos del componente anterior
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '24px',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white', borderRadius: '20px', padding: '32px',
  width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
  fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #ddd',
  fontSize: '16px', fontFamily: 'Verdana', boxSizing: 'border-box',
};

const closeButtonStyle: React.CSSProperties = {
  width: '40px', height: '40px', borderRadius: '50%', border: 'none',
  backgroundColor: '#f5f5f5', fontSize: '20px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '14px 24px', borderRadius: '12px', border: 'none',
  fontFamily: 'Verdana', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
};
