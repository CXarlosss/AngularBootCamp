import React, { useState } from 'react';
import type { ClinicalAnnex, SelfCheckContent } from '../../types/clinicalAnnex';
import { updateAnnexContent } from '../../services/clinicalAnnexService';
import { exportAnnexPDF, type PDFAudience, type CompletedWayInfo } from '../../services/pdfExportService';
import { ClinicalAnnexPrefill } from '../../services/clinicalAnnexPrefill';
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
  const [audience, setAudience] = useState<PDFAudience>('clinical');
  const [wayTags, setWayTags] = useState<Array<{ id: string; label: string; emoji: string; color: string }>>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedWayIds, setSelectedWayIds] = useState<Set<string>>(new Set());
  const [completedWaysData, setCompletedWaysData] = useState<CompletedWayInfo[]>([]);

  React.useEffect(() => {
    const loadPrefill = async () => {
      const ways = await ClinicalAnnexPrefill.getWeeklyCompletedWays(annex.patient_id, annex.week_start);
      const weeklyMetrics = await ClinicalAnnexPrefill.getWeeklyMetrics(annex.patient_id, annex.week_start);
      
      setCompletedWaysData(ways);
      setWayTags(ClinicalAnnexPrefill.generateWayTags(ways));
      setMetrics(weeklyMetrics);
      setSelectedWayIds(new Set(ways.map(w => w.id)));

      if (!content.therapistNotes) {
        setContent(prev => ({ ...prev, therapistNotes: ClinicalAnnexPrefill.generateFamilySummary(weeklyMetrics, patientName) }));
      }
    };
    loadPrefill();
  }, [annex.patient_id, annex.week_start]);

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

  function handleExport() {
    const selectedWays = completedWaysData.filter(w => selectedWayIds.has(w.id));
    const totalSelectedMinutes = Math.round(selectedWays.reduce((sum, w) => sum + w.timeSpentSeconds, 0) / 60);

    exportAnnexPDF({
      patientName: patientName,
      patientAge: 8,
      avatarEmoji: '🌟',
      weekStart: annex.week_start,
      weekEnd: annex.week_start,
      therapistName: 'Maite',
      licenseNumber: 'Col: 12345',
      completedWays: selectedWays,
      totalTimeMinutes: totalSelectedMinutes || 0,
      sessionsAttended: metrics?.sessionsAttended || 0,
      technique: 'Autocomprobación',
      duration: '10 min',
      childResponse: 'positive',
      therapistNotes: content.therapistNotes || '',
      annexType: 'selfcheck'
    }, audience, `WAY+_${patientName}_${annex.week_start}_${audience}`);
  }

  return (
    <div style={overlayStyle}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🪞 Registro de Autocomprobación</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Cerrar">✕</button>
        </div>

        {/* Auto data (Smart Prefill) */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Retos completados esta semana</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>Toca para incluir/excluir del anexo</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {wayTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  const newSet = new Set(selectedWayIds);
                  if (newSet.has(tag.id)) newSet.delete(tag.id);
                  else newSet.add(tag.id);
                  setSelectedWayIds(newSet);
                }}
                style={{
                  padding: '8px 12px', borderRadius: '20px', border: 'none',
                  fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedWayIds.has(tag.id) ? tag.color : '#E5E7EB',
                  color: selectedWayIds.has(tag.id) ? 'white' : '#6B7280',
                  opacity: selectedWayIds.has(tag.id) ? 1 : 0.5,
                }}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>

          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.totalWaysCompleted}</div>
                <div style={{ fontSize: '11px' }}>Retos</div>
              </div>
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.totalTimeMinutes}</div>
                <div style={{ fontSize: '11px' }}>Minutos</div>
              </div>
              <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.sessionsAttended}</div>
                <div style={{ fontSize: '11px' }}>Días</div>
              </div>
            </div>
          )}
          
          {/* Audiencia Toggle */}
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Versión del PDF</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setAudience('clinical')}
                style={{
                  ...actionButtonStyle,
                  border: `2px solid ${audience === 'clinical' ? '#2563EB' : '#ddd'}`,
                  backgroundColor: audience === 'clinical' ? '#2563EB' : '#f5f5f5',
                  color: audience === 'clinical' ? 'white' : '#666',
                  flex: 1
                }}
              >
                🩺 Clínico
              </button>
              <button
                onClick={() => setAudience('family')}
                style={{
                  ...actionButtonStyle,
                  border: `2px solid ${audience === 'family' ? '#22C55E' : '#ddd'}`,
                  backgroundColor: audience === 'family' ? '#22C55E' : '#f5f5f5',
                  color: audience === 'family' ? 'white' : '#666',
                  flex: 1
                }}
              >
                👨‍👩‍👧 Familiar
              </button>
            </div>
          </div>
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
          <button onClick={handleExport} style={{ ...actionButtonStyle, backgroundColor: '#f5f5f5', color: '#333' }}>
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
