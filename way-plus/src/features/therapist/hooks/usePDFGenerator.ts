import { PDF_COLORS, PDF_FONTS } from '../utils/pdfStyles';

export interface ReportData {
  name: string;
  racha: number;
  lastSession: string;
  radar: { subject: string; current: number; past: number; avg: number }[];
  progress: { week: string; ways: number; xp: number }[];
}

export function usePDFGenerator() {
  const generateClinicalReport = async (data: ReportData, recommendations: string): Promise<Blob> => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const margin = 20;
    let yPos = margin;

    // Header
    doc.setFontSize(PDF_FONTS.headerSize);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('WAY+ Informe de Progreso', margin, yPos);
    
    yPos += 15;
    
    // Info del paciente
    doc.setFontSize(PDF_FONTS.textSize);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`Paciente: ${data.name}`, margin, yPos);
    yPos += 7;
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 7;
    doc.text(`Última Sesión: ${data.lastSession}`, margin, yPos);
    yPos += 15;

    // Separador
    doc.setDrawColor(...PDF_COLORS.border);
    doc.line(margin, yPos, 210 - margin, yPos);
    yPos += 15;

    // Sección: Competencias (Radar)
    doc.setFontSize(PDF_FONTS.titleSize);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('RADAR DE COMPETENCIAS', margin, yPos);
    yPos += 10;

    doc.setFontSize(PDF_FONTS.smallSize);
    data.radar.forEach((item) => {
      // Nombre de competencia
      doc.setTextColor(...PDF_COLORS.text);
      doc.text(item.subject, margin, yPos);
      
      // Barra de progreso fondo
      const barX = margin + 40;
      const barWidth = 100;
      const barHeight = 6;
      doc.setFillColor(...PDF_COLORS.bg);
      doc.rect(barX, yPos - 5, barWidth, barHeight, 'F');
      
      // Barra de progreso llena
      const fillWidth = (item.current / 100) * barWidth;
      
      // Color según nivel
      if (item.current < 40) doc.setFillColor(...PDF_COLORS.warning);
      else if (item.current > 80) doc.setFillColor(...PDF_COLORS.secondary);
      else doc.setFillColor(...PDF_COLORS.primary);
      
      doc.rect(barX, yPos - 5, fillWidth, barHeight, 'F');
      
      // Texto %
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text(`${item.current}%`, barX + barWidth + 5, yPos);
      
      if (item.current < 40) {
        doc.setTextColor(...PDF_COLORS.warning);
        doc.text('<- Atencion', barX + barWidth + 20, yPos);
      }
      
      yPos += 10;
    });

    yPos += 10;

    // Sección: Progreso
    doc.setFontSize(PDF_FONTS.titleSize);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('PROGRESO (Ultimas semanas)', margin, yPos);
    yPos += 10;

    const firstWeek = data.progress[0];
    const lastWeek = data.progress[data.progress.length - 1];
    
    doc.setFontSize(PDF_FONTS.textSize);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`WAYs completados: ${firstWeek?.ways ?? 0} -> ${lastWeek?.ways ?? 0}`, margin, yPos);
    yPos += 8;
    doc.text(`XP acumulado: ${firstWeek?.xp ?? 0} -> ${lastWeek?.xp ?? 0}`, margin, yPos);
    yPos += 20;

    // Sección: Recomendaciones
    doc.setFontSize(PDF_FONTS.titleSize);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('RECOMENDACIONES', margin, yPos);
    yPos += 10;

    doc.setFontSize(PDF_FONTS.textSize);
    doc.setTextColor(...PDF_COLORS.muted);
    
    const splitText = doc.splitTextToSize(`"${recommendations}"`, 170);
    doc.text(splitText, margin, yPos);

    yPos += (splitText.length * 7) + 30;

    // Firma
    doc.setDrawColor(...PDF_COLORS.muted);
    doc.line(margin, yPos, margin + 60, yPos);
    yPos += 6;
    doc.text('Firma del Terapeuta', margin, yPos);

    return doc.output('blob');
  };

  return { generateClinicalReport };
}
