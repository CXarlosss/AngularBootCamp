import React, { useState } from 'react';
import { usePDFGenerator, type ReportData } from '../hooks/usePDFGenerator';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: ReportData;
}

export function ExportReportModal({ isOpen, onClose, patientData }: ExportReportModalProps) {
  const [recommendations, setRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateClinicalReport } = usePDFGenerator();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateClinicalReport(patientData, recommendations || 'Sin recomendaciones adicionales.');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Informe_${patientData.name.replace(/[^a-zA-Z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error('Error al generar PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: 30,
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 24, color: '#1E1B4B' }}>📄 Exportar Informe</h2>
        
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1E1B4B' }}>Paciente: {patientData.name}</p>
          <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: 14 }}>Se incluira el radar de competencias y el progreso de las ultimas semanas.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#1E1B4B' }}>
            Recomendaciones del Terapeuta
          </label>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Escribe las recomendaciones a incluir en el informe..."
            style={{
              width: '100%',
              minHeight: 120,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#374151'
            }}
            disabled={isGenerating}
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#4F46E5',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: isGenerating ? 0.7 : 1
            }}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
