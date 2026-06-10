import React, { useState } from 'react';
import { ClinicalAnnex, RelaxationContent } from '../../types/clinicalAnnex';
import { updateAnnexContent } from '../../services/clinicalAnnexService';
import { downloadAnnexPDF } from '../../services/pdfExportService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  annex: ClinicalAnnex;
  onClose: () => void;
  patientName: string;
}

const TECHNIQUES = [
  'Respiración con globo',
  'Arroyo (sonido)',
  'Progresiva muscular',
  'Visualización guiada',
  'Otra',
];

const RESPONSES = [
  { value: 'calm', label: 'Calmado', emoji: '😌' },
  { value: 'restless', label: 'Inquieto', emoji: '😐' },
  { value: 'resistant', label: 'Resistente', emoji: '😣' },
  { value: 'engaged', label: 'Participativo', emoji: '🤗' },
] as const;

export function RelaxationAnnexForm({ annex, onClose, patientName }: Props) {
  const [content, setContent] = useState<RelaxationContent>(annex.content as RelaxationContent || {});
  const [status, setStatus] = useState<'draft' | 'completed'>('draft');
  const [saving, setSaving] = useState(false);

  async function handleSave(completed = false) {
    setSaving(true);
    const newStatus = completed ? 'completed' : 'draft';
    await updateAnnexContent(annex.id, content, newStatus);
    setStatus(newStatus);
    setSaving(false);
    if (completed) onClose();
  }

  function handleExport() {
    downloadAnnexPDF({ ...annex, content, status }, patientName);
  }

  return (
    <div style={overlayStyle}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={modalStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1a1a' }}>
            🧘 Registro de Relajación
          </h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Técnica */}
          <div>
            <label htmlFor="technique" style={labelStyle}>Técnica utilizada</label>
            <select
              id="technique"
              value={content.technique || ''}
              onChange={e => setContent({ ...content, technique: e.target.value })}
              style={inputStyle}
            >
              <option value="">Selecciona...</option>
              {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Duración */}
          <div>
            <label htmlFor="duration" style={labelStyle}>Duración (minutos)</label>
            <input
              id="duration"
              type="number"
              min={1}
              max={60}
              value={content.durationMinutes || ''}
              onChange={e => setContent({ ...content, durationMinutes: Number(e.target.value) })}
              style={inputStyle}
            />
          </div>

          {/* Respuesta del niño */}
          <div>
            <span style={labelStyle}>Respuesta del niño</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
              {RESPONSES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setContent({ ...content, childResponse: r.value })}
                  style={{
                    ...responseButtonStyle,
                    borderColor: content.childResponse === r.value ? '#4A90D9' : '#ddd',
                    backgroundColor: content.childResponse === r.value ? '#e3f2fd' : '#fff',
                  }}
                  aria-pressed={content.childResponse === r.value}
                  aria-label={r.label}
                >
                  <span style={{ fontSize: '32px' }}>{r.emoji}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" style={labelStyle}>Notas del terapeuta</label>
            <textarea
              id="notes"
              rows={4}
              value={content.therapistNotes || ''}
              onChange={e => setContent({ ...content, therapistNotes: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Observaciones clínicas..."
            />
          </div>

          {/* Auto data */}
          <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Resumen semanal (auto)</h4>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Ways completados: <strong>{annex.auto_data.ways_completed_this_week}</strong></p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Tiempo total: <strong>{annex.auto_data.total_time_minutes} min</strong></p>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
          <button onClick={handleExport} style={{ ...actionButtonStyle, backgroundColor: '#f5f5f5', color: '#333' }}>
            📄 Exportar PDF
          </button>
          <button 
            onClick={() => handleSave(false)} 
            disabled={saving}
            style={{ ...actionButtonStyle, backgroundColor: '#ffc107', color: '#333' }}
          >
            {saving ? 'Guardando...' : '💾 Guardar borrador'}
          </button>
          <button 
            onClick={() => handleSave(true)} 
            disabled={saving}
            style={{ ...actionButtonStyle, backgroundColor: '#4caf50', color: 'white' }}
          >
            ✅ Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '32px',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '2px solid #ddd',
  fontSize: '16px',
  fontFamily: 'Verdana',
  boxSizing: 'border-box',
};

const responseButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  borderRadius: '14px',
  border: '3px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const closeButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#f5f5f5',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '14px 24px',
  borderRadius: '12px',
  border: 'none',
  fontFamily: 'Verdana',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
