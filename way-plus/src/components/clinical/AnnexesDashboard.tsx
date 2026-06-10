import React, { useState, useEffect } from 'react';
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClinicalAnnexType, AnnexWeekStatus, ClinicalAnnex } from '../../types/clinicalAnnex';
import { getOrCreateAnnex, getWeekStatus, flushOfflineAnnexes } from '../../services/clinicalAnnexService';
import { RelaxationAnnexForm } from './RelaxationAnnexForm';
import { SelfCheckAnnexForm } from './SelfCheckAnnexForm';
import { RoleplayAnnexForm } from './RoleplayAnnexForm';

const TYPE_CONFIG: Record<ClinicalAnnexType, { label: string; color: string; emoji: string }> = {
  relaxation: { label: 'Relajación', color: '#4A90D9', emoji: '🧘' },
  selfcheck: { label: 'Autocomprobación', color: '#7B68EE', emoji: '🪞' },
  roleplay: { label: 'Role-Playing', color: '#FF8C42', emoji: '🎭' },
};

interface Props {
  patientId: string;
  therapistId: string;
  patientName: string;
}

export function AnnexesDashboard({ patientId, therapistId, patientName }: Props) {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekStatus, setWeekStatus] = useState<AnnexWeekStatus | null>(null);
  const [activeForm, setActiveForm] = useState<ClinicalAnnexType | null>(null);
  const [previewAnnex, setPreviewAnnex] = useState<ClinicalAnnex | null>(null);

  const weekStartStr = format(currentWeek, 'yyyy-MM-dd');
  const weekLabel = format(currentWeek, "'Semana del' dd MMM", { locale: es });

  useEffect(() => {
    loadWeekStatus();
    flushOfflineAnnexes().catch(err => console.error('Background flush failed:', err));
  }, [currentWeek, patientId]);

  async function loadWeekStatus() {
    const status = await getWeekStatus(patientId, weekStartStr);
    setWeekStatus({
      week_start: weekStartStr,
      relaxation: status.find(s => s.type === 'relaxation')?.status || 'empty',
      selfcheck: status.find(s => s.type === 'selfcheck')?.status || 'empty',
      roleplay: status.find(s => s.type === 'roleplay')?.status || 'empty',
    });
  }

  async function handleOpenForm(type: ClinicalAnnexType) {
    const annex = await getOrCreateAnnex(patientId, therapistId, weekStartStr, type);
    setActiveForm(type);
    setPreviewAnnex(annex);
  }

  function handleCloseForm() {
    setActiveForm(null);
    setPreviewAnnex(null);
    loadWeekStatus();
  }

  const types: ClinicalAnnexType[] = ['relaxation', 'selfcheck', 'roleplay'];

  return (
    <div style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', margin: 0, color: '#1a1a1a' }}>
          📋 Anexos Clínicos: {patientName}
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            style={navButtonStyle}
            aria-label="Semana anterior"
          >
            ←
          </button>
          <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '180px', textAlign: 'center' }}>
            {weekLabel}
          </span>
          <button 
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            style={navButtonStyle}
            aria-label="Semana siguiente"
          >
            →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {types.map(type => {
          const config = TYPE_CONFIG[type];
          const status = weekStatus?.[type] || 'empty';
          const statusColors = {
            empty: { bg: '#f5f5f5', border: '#ddd', text: '#888' },
            draft: { bg: '#fff8e1', border: '#ffc107', text: '#f57f17' },
            completed: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
          };
          const colors = statusColors[status as keyof typeof statusColors];

          return (
            <div 
              key={type}
              style={{
                border: `3px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: colors.bg,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => handleOpenForm(type)}
              role="button"
              aria-label={`Abrir anexo de ${config.label}, estado: ${status}`}
            >
              <div style={{ fontSize: '48px', textAlign: 'center' }}>{config.emoji}</div>
              <h3 style={{ margin: 0, fontSize: '18px', textAlign: 'center', color: colors.text }}>
                {config.label}
              </h3>
              <div style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: colors.text 
              }}>
                {status === 'empty' && 'Pendiente'}
                {status === 'draft' && 'Borrador'}
                {status === 'completed' && 'Completado'}
              </div>
              {status !== 'empty' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenForm(type);
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: config.color,
                    color: 'white',
                    fontFamily: 'Verdana',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {status === 'draft' ? 'Continuar' : 'Ver / Exportar'}
                </button>
              )}
              {status === 'empty' && (
                <button
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `2px dashed ${config.color}`,
                    backgroundColor: 'transparent',
                    color: config.color,
                    fontFamily: 'Verdana',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  + Crear anexo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeForm === 'relaxation' && previewAnnex && (
        <RelaxationAnnexForm annex={previewAnnex} onClose={handleCloseForm} patientName={patientName} />
      )}
      {activeForm === 'selfcheck' && previewAnnex && (
        <SelfCheckAnnexForm annex={previewAnnex} onClose={handleCloseForm} patientName={patientName} />
      )}
      {activeForm === 'roleplay' && previewAnnex && (
        <RoleplayAnnexForm annex={previewAnnex} onClose={handleCloseForm} patientName={patientName} />
      )}
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  border: '2px solid #333',
  backgroundColor: '#fff',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Verdana',
};
