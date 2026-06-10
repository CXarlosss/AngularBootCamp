import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClinicalAnnex, ClinicalAnnexType } from '../types/clinicalAnnex';

const TYPE_LABELS: Record<ClinicalAnnexType, string> = {
  relaxation: 'Registro de Relajación',
  selfcheck: 'Registro de Autocomprobación',
  roleplay: 'Registro de Role-Playing',
};

export function generateAnnexPDF(annex: ClinicalAnnex, patientName: string): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Membrete clínico
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('WAY+ Centro Clínico', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${patientName}`, 20, 40);
  doc.text(`Semana del: ${annex.week_start}`, 20, 48);
  doc.text(`Tipo: ${TYPE_LABELS[annex.type]}`, 20, 56);
  doc.text(`Estado: ${annex.status === 'completed' ? 'Completado' : 'Borrador'}`, 20, 64);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 72);

  // Datos auto
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de la semana (auto)', 20, 88);
  doc.setFont('helvetica', 'normal');
  
  autoTable(doc, {
    startY: 94,
    head: [['Métrica', 'Valor']],
    body: [
      ['Ways completados', annex.auto_data.ways_completed_this_week.toString()],
      ['Tiempo total (min)', annex.auto_data.total_time_minutes.toString()],
      ['Tasa homework (%)', annex.auto_data.homework_completion_rate.toString()],
      ['Última sesión', annex.auto_data.last_session_date 
        ? new Date(annex.auto_data.last_session_date).toLocaleDateString('es-ES') 
        : 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 11 },
  });

  // Contenido del formulario
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Observaciones clínicas', 20, finalY);
  doc.setFont('helvetica', 'normal');

  const contentRows = Object.entries(annex.content).map(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    let displayValue = '—';
    if (value === null || value === undefined) displayValue = '—';
    else if (Array.isArray(value)) displayValue = value.join(', ');
    else if (typeof value === 'object') displayValue = JSON.stringify(value);
    else displayValue = String(value);

    return [label, displayValue];
  });

  autoTable(doc, {
    startY: finalY + 6,
    head: [['Campo', 'Respuesta']],
    body: contentRows,
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  // Firma
  const bottomY = doc.internal.pageSize.getHeight() - 30;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('_______________________________', pageWidth / 2, bottomY, { align: 'center' });
  doc.text('Firma del terapeuta', pageWidth / 2, bottomY + 6, { align: 'center' });
  doc.text(`ID del registro: ${annex.id.slice(0, 8)}`, pageWidth / 2, bottomY + 14, { align: 'center' });

  return doc;
}

export function downloadAnnexPDF(annex: ClinicalAnnex, patientName: string) {
  const doc = generateAnnexPDF(annex, patientName);
  doc.save(`WAY_Anexo_${annex.type}_${annex.week_start}_${patientName}.pdf`);
}
