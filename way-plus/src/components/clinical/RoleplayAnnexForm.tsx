import React, { useState } from 'react';
import { ClinicalAnnex, RoleplayContent } from '../../types/clinicalAnnex';
import { updateAnnexContent } from '../../services/clinicalAnnexService';
import { downloadAnnexPDF } from '../../services/pdfExportService';
import { motion } from 'framer-motion';

interface Props {
  annex: ClinicalAnnex;
  onClose: () => void;
  patientName: string;
}

const SCENARIOS = [
  { id: 'rp-1', title: 'Pido ayuda en clase' },
  { id: 'rp-2', title: 'Digo que no a un amigo' },
  { id: 'rp-3', title: 'Pido turno en la tienda' },
  { id: 'rp-4', title: 'Expreso enfado sin gritar' },
  { id: 'rp-5', title: 'Saludo a alguien nuevo' },
];

const PARTICIPATION = [
  { value: 'high', label: 'Alta', emoji: '⭐⭐⭐', color: '#43a047' },
  { value: 'medium', label: 'Media', emoji: '⭐⭐', color: '#fdd835' },
  { value: 'low', label: 'Baja', emoji: '⭐', color: '#fb8c00' },
  { value: 'refused', label: 'Rechazó', emoji: '🚫', color: '#e53935' },
] as const;

export function RoleplayAnnexForm({ annex, onClose, patientName }: Props) {
  const [content, setContent] = useState<RoleplayContent>(annex.content as RoleplayContent || {});
  const [saving, setSaving] = useState(false);

  async function handleSave(completed = false) {
    setSaving(true);
    await updateAnnexContent(annex.id, content, completed ? 'completed' : 'draft');
    setSaving(false);
    if (completed) onClose();
  }

  return (
    <div style={overlayStyle}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🎭 Registro de Role-Playing</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Cerrar">✕</button>
        </div>

        {/* Escenario */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="scenario" style={labelStyle}>Escenario practicado</label>
          <select
            id="scenario"
            value={content.scenarioId || ''}
            onChange={e => {
              const s = SCENARIOS.find(x => x.id === e.target.value);
              setContent({ ...content, scenarioId: s?.id, scenarioTitle: s?.title });
            }}
            style={inputStyle}
          >
            <option value="">Selecciona escenario...</option>
            {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        {/* Rol asignado */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="role" style={labelStyle}>Rol asignado al niño</label>
          <input
            id="role"
            type="text"
            value={content.roleAssigned || ''}
            onChange={e => setContent({ ...content, roleAssigned: e.target.value })}
            style={inputStyle}
            placeholder="Ej: 'Profesor', 'Compañero', 'Vendedor'"
          />
        </div>

        {/* Nivel de participación */}
        <div style={{ marginBottom: '24px' }}>
          <span style={labelStyle}>Nivel de participación</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '10px' }}>
            {PARTICIPATION.map(p => (
              <button
                key={p.value}
                onClick={() => setContent({ ...content, participationLevel: p.value as any })}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '3px solid',
                  borderColor: content.participationLevel === p.value ? p.color : '#eee',
                  backgroundColor: content.participationLevel === p.value ? p.color + '15' : '#fff',
                  fontFamily: 'Verdana',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: content.participationLevel === p.value ? p.color : '#555',
                }}
                aria-pressed={content.participationLevel === p.value}
              >
                <span style={{ fontSize: '24px' }}>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generalización */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="gen-notes" style={labelStyle}>Notas de generalización</label>
          <textarea
            id="gen-notes"
            rows={3}
            value={content.generalizationNotes || ''}
            onChange={e => setContent({ ...content, generalizationNotes: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="¿Ha transferido la habilidad a otros contextos?"
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

// Reutilizamos estilos base
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
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
