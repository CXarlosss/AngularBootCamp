import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Tipos ─────────────────────────────────────────────────────────

export type PDFAudience = 'clinical' | 'family';

export interface AnnexData {
  patientName: string;
  patientAge: number;
  avatarEmoji: string;
  weekStart: string; // ISO date
  weekEnd: string;
  therapistName: string;
  licenseNumber: string; // Nº colegiado
  
  // Pre-fill desde activity_logs
  completedWays: CompletedWayInfo[];
  totalTimeMinutes: number;
  sessionsAttended: number;
  
  // Datos que escribe Maite
  technique: string;
  duration: string;
  childResponse: 'very-positive' | 'positive' | 'neutral' | 'difficult';
  therapistNotes: string;
  
  // Metadatos
  annexType: 'relaxation' | 'selfcheck' | 'roleplay';
}

export interface CompletedWayInfo {
  id: string;
  title: string;
  step: number;
  stepTitle: string;
  completedAt: string;
  attempts: number;
  timeSpentSeconds: number;
  isHomework: boolean;
}

// ─── Configuración visual ─────────────────────────────────────────

const COLORS = {
  primary: '#2563EB',      // Blue-600
  success: '#22C55E',      // Green-500
  warning: '#F59E0B',      // Amber-500
  danger: '#EF4444',       // Red-500
  gray: '#6B7280',         // Gray-500
  lightGray: '#F3F4F6',    // Gray-100
  white: '#FFFFFF',
  black: '#111827',
};

const FONTS = {
  header: 20,
  subheader: 14,
  body: 11,
  small: 9,
  emoji: 16,
};

// ─── Servicio principal ───────────────────────────────────────────

export class PDFExportService {
  private doc: jsPDF;
  private audience: PDFAudience;
  private data: AnnexData;

  constructor(data: AnnexData, audience: PDFAudience) {
    this.data = data;
    this.audience = audience;
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Configurar fuentes para acentos españoles
    this.doc.setFont('helvetica');
  }

  // ─── Entry point ─────────────────────────────────────────────────

  public generate(): jsPDF {
    if (this.audience === 'clinical') {
      this.generateClinical();
    } else {
      this.generateFamily();
    }
    return this.doc;
  }

  public download(filename?: string): void {
    const defaultName = `WAY+_${this.data.patientName}_${this.data.weekStart}_${this.audience}.pdf`;
    this.doc.save(filename || defaultName);
  }

  // ═════════════════════════════════════════════════════════════════
  // MODO CLÍNICO: Riguroso, técnico, para escuela y colegiados
  // ═════════════════════════════════════════════════════════════════

  private generateClinical(): void {
    const { doc, data } = this;
    let y = 20;

    // ─── Membrete profesional ─────────────────────────────────────
    doc.setFillColor(COLORS.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(COLORS.white);
    doc.setFontSize(FONTS.header);
    doc.setFont('helvetica', 'bold');
    doc.text('WAY+ — ANEXO CLÍNICO', 20, 20);
    
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'normal');
    doc.text(`Terapeuta: ${data.therapistName} | Colegiado: ${data.licenseNumber}`, 20, 28);
    doc.text(`Semana: ${data.weekStart} → ${data.weekEnd}`, 120, 28);

    y = 45;

    // ─── Datos del paciente ───────────────────────────────────────
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL PACIENTE', 20, y);
    
    y += 8;
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${data.patientName} | Edad: ${data.patientAge} años`, 20, y);
    y += 6;
    doc.text(`Sesiones asistidas: ${data.sessionsAttended} | Tiempo total: ${data.totalTimeMinutes} min`, 20, y);

    y += 15;

    // ─── Ways completados (tabla técnica) ─────────────────────────
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE ACTIVIDADES', 20, y);
    y += 5;

    const tableData = data.completedWays.map(w => [
      w.id,
      w.title,
      w.stepTitle,
      w.isHomework ? 'Sí' : 'No',
      `${w.attempts}`,
      `${(w.timeSpentSeconds / 60).toFixed(1)} min`,
      new Date(w.completedAt).toLocaleDateString('es-ES'),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['ID', 'Reto', 'Step', 'Deberes', 'Intentos', 'Tiempo', 'Fecha']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: FONTS.small,
      },
      bodyStyles: {
        fontSize: FONTS.small,
        textColor: COLORS.black,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 40 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // ─── Evaluación terapéutica ───────────────────────────────────
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUACIÓN TERAPÉUTICA', 20, y);
    y += 10;

    // Técnica aplicada
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'bold');
    doc.text('Técnica:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.technique, 50, y);
    y += 8;

    // Duración
    doc.setFont('helvetica', 'bold');
    doc.text('Duración:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.duration, 50, y);
    y += 8;

    // Respuesta del niño (escala técnica)
    const responseLabels = {
      'very-positive': 'Muy positiva (4/4) — Participación activa y generalización',
      'positive': 'Positiva (3/4) — Cooperación con mínima resistencia',
      'neutral': 'Neutral (2/4) — Participación variable, necesita refuerzo',
      'difficult': 'Difícil (1/4) — Resistencia significativa, requiere adaptación',
    };

    doc.setFont('helvetica', 'bold');
    doc.text('Respuesta:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(responseLabels[data.childResponse] || data.childResponse, 50, y);
    y += 12;

    // Notas del terapeuta (caja con borde)
    doc.setFont('helvetica', 'bold');
    doc.text('Notas clínicas:', 20, y);
    y += 6;
    
    doc.setDrawColor(COLORS.gray);
    doc.setLineWidth(0.5);
    doc.rect(20, y, 170, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONTS.body);
    
    const splitNotes = doc.splitTextToSize(data.therapistNotes || '', 160);
    doc.text(splitNotes, 25, y + 6);

    y += 50;

    // ─── Firma y sello ────────────────────────────────────────────
    doc.setFontSize(FONTS.small);
    doc.setTextColor(COLORS.gray);
    doc.text('Documento generado por WAY+ | Validez clínica sujeta a revisión profesional', 20, y);
    y += 5;
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);

    // Línea de firma
    y += 15;
    doc.setDrawColor(COLORS.black);
    doc.setLineWidth(0.5);
    doc.line(20, y, 80, y);
    doc.setFontSize(FONTS.body);
    doc.setTextColor(COLORS.black);
    doc.text(`Firma: ${data.therapistName}`, 20, y + 5);
  }

  // ═════════════════════════════════════════════════════════════════
  // MODO FAMILIAR: Visual, empático, sin jerga técnica
  // ═════════════════════════════════════════════════════════════════

  private generateFamily(): void {
    const { doc, data } = this;
    let y = 20;

    // ─── Cabecera amigable ──────────────────────────────────────
    doc.setFillColor(COLORS.success);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(COLORS.white);
    doc.setFontSize(FONTS.header);
    doc.setFont('helvetica', 'bold');
    doc.text(`¡Hola familia de ${data.patientName}!`, 20, 18);

    y = 35;

    // ─── Emoji y resumen visual ─────────────────────────────────
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.emoji);
    doc.text(data.avatarEmoji || '🌟', 20, y);
    
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text(`Esta semana ${data.patientName} ha hecho grandes cosas`, 45, y);

    y += 12;

    // ─── Tarjetas de logros (cajas de colores) ────────────────────
    const stats = [
      { label: 'Retos completados', value: `${data.completedWays.length}`, color: COLORS.primary },
      { label: 'Minutos de juego', value: `${data.totalTimeMinutes}`, color: COLORS.success },
      { label: 'Días de práctica', value: `${data.sessionsAttended}`, color: COLORS.warning },
    ];

    let x = 20;
    for (const stat of stats) {
      doc.setFillColor(stat.color);
      doc.roundedRect(x, y, 55, 30, 3, 3, 'F');
      
      doc.setTextColor(COLORS.white);
      doc.setFontSize(FONTS.header);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value, x + 5, y + 12);
      
      doc.setFontSize(FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + 5, y + 22);
      
      x += 60;
    }

    y += 45;

    // ─── "¿Qué hemos practicado?" ───────────────────────────────
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('¿Qué hemos practicado esta semana?', 20, y);
    y += 10;

    // Lista visual de ways (sin IDs técnicos)
    for (const way of data.completedWays.slice(0, 5)) { // máximo 5 para no saturar
      const icon = way.isHomework ? '🏠' : '⭐';
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
      doc.text(`${icon} ${way.title}`, 25, y);
      y += 7;
    }

    if (data.completedWays.length > 5) {
      doc.setTextColor(COLORS.gray);
      doc.setFontSize(FONTS.small);
      doc.text(`... y ${data.completedWays.length - 5} retos más`, 25, y);
      y += 7;
    }

    y += 10;

    // ─── "¿Cómo se ha sentido?" ───────────────────────────────────
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('¿Cómo se ha sentido durante las sesiones?', 20, y);
    y += 10;

    // Emoji grande según respuesta
    const responseEmojis = {
      'very-positive': '😄 ¡Muy bien! Participó con muchas ganas',
      'positive': '🙂 Bien. Cooperó y disfrutó',
      'neutral': '😐 Regular. A veces le costó un poco',
      'difficult': '😕 Difícil. Necesitó más apoyo esta semana',
    };

    const responseColors = {
      'very-positive': COLORS.success,
      'positive': '#34D399',
      'neutral': COLORS.warning,
      'difficult': COLORS.danger,
    };

    const resolvedResponse = responseEmojis[data.childResponse] || responseEmojis['positive'];
    const resolvedColor = responseColors[data.childResponse] || responseColors['positive'];

    doc.setFillColor(resolvedColor);
    doc.roundedRect(20, y, 170, 25, 5, 5, 'F');
    
    doc.setTextColor(COLORS.white);
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'bold');
    doc.text(resolvedResponse, 25, y + 10);

    y += 35;

    // ─── "Consejo para casa" ─────────────────────────────────────
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.subheader);
    doc.setFont('helvetica', 'bold');
    doc.text('Consejo para practicar en casa', 20, y);
    y += 8;

    doc.setFillColor(COLORS.lightGray);
    doc.roundedRect(20, y, 170, 30, 3, 3, 'F');
    
    doc.setTextColor(COLORS.black);
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'normal');
    const tips = doc.splitTextToSize(data.therapistNotes || '', 160);
    doc.text(tips, 25, y + 8);

    y += 40;

    // ─── Pie de página cálido ─────────────────────────────────────
    doc.setTextColor(COLORS.gray);
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'italic');
    doc.text('Este informe es un resumen semanal de las sesiones terapéuticas.', 20, y);
    y += 5;
    doc.text('Para dudas, contacta con tu terapeuta. ¡Seguimos trabajando juntos!', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} | WAY+`, 20, y);
  }
}

// ─── Helper para uso rápido ───────────────────────────────────────

export const exportAnnexPDF = (
  data: AnnexData,
  audience: PDFAudience,
  filename?: string
): void => {
  const service = new PDFExportService(data, audience);
  service.generate();
  service.download(filename);
};
