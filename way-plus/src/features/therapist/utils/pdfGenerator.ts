import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Patient } from '../store/therapistStore';

interface ReportData {
  patient: Patient;
  dateRange: string;
  completedWays: number;
  totalWays: number;
  relaxationSessions: number;
  roleplaySessions: number;
  streakDays: number;
  totalXp: number;
  economicProfile: string;
  savingRatio: number;
  alerts: Array<{ title: string; message: string; type: string }>;
  weeklyData: Array<{ day: string; relaxation: boolean; roleplay: boolean; selfcheck: boolean }>;
  wayBreakdown: Array<{ category: string; count: number }>;
}

export async function generateWAYReport(data: ReportData): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Paleta de colores WAY+ (suave, clínica, infantil pero profesional)
  const COLORS = {
    primary: [99, 102, 241] as [number, number, number],    // Indigo-500
    secondary: [16, 185, 129] as [number, number, number],  // Emerald-500
    accent: [245, 158, 11] as [number, number, number],     // Amber-500
    text: [55, 65, 81] as [number, number, number],         // Gray-700
    light: [243, 244, 246] as [number, number, number],     // Gray-100
  };

  // ========== PORTADA ==========
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Header decorativo
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(0, 0, pageWidth, 45, 0, 0, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('WAY+', 20, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Método de Gamificación en Habilidades Sociales', 20, 35);
  
  // Avatar y nombre del paciente
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(48);
  doc.text(data.patient.avatar, pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Informe de Evolución`, pageWidth / 2, 100, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.patient.name}`, pageWidth / 2, 110, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(`Edad: ${data.patient.age} años | Nivel: ${data.patient.currentLevel}`, pageWidth / 2, 120, { align: 'center' });
  doc.text(`Periodo: ${data.dateRange} | Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 128, { align: 'center' });
  
  // ========== SECCIÓN 1: RESUMEN EJECUTIVO ==========
  doc.addPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen Ejecutivo', 20, 25);
  
  // KPIs en cajas
  const kpiY = 40;
  const kpiWidth = (pageWidth - 50) / 3;
  const kpis = [
    { label: 'Retos Completados', value: `${data.completedWays}/${data.totalWays}`, color: COLORS.primary },
    { label: 'Días de Racha', value: `${data.streakDays}`, color: COLORS.accent },
    { label: 'XP Total', value: `${data.totalXp}`, color: COLORS.secondary },
  ];
  
  kpis.forEach((kpi, i) => {
    const x = 20 + i * (kpiWidth + 5);
    doc.setFillColor(...kpi.color);
    doc.roundedRect(x, kpiY, kpiWidth, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(kpi.label, x + 5, kpiY + 8);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, x + 5, kpiY + 20);
  });
  
  // Texto narrativo automático
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const completionRate = Math.round((data.completedWays / (data.totalWays || 1)) * 100);
  const narrative = [
    `Durante el periodo analizado, ${data.patient.name} ha completado el ${completionRate}% de los retos propuestos,`,
    `demostrando ${data.streakDays > 3 ? 'una adherencia notable al tratamiento' : 'fluctuaciones en la adherencia que requieren atención'}.`,
    `Se han registrado ${data.relaxationSessions} sesiones de relajación y ${data.roleplaySessions} prácticas de roleplay en entorno natural.`,
    `El perfil económico-conductual identificado es: "${data.economicProfile}" (ratio de ahorro: ${Math.round(data.savingRatio * 100)}%).`,
  ].join(' ');
  
  doc.text(narrative, 20, 85, { maxWidth: pageWidth - 40, align: 'justify' });

  // ========== SECCIÓN 2: TABLA DE WAYS ==========
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Objetivos Alcanzados', 20, 115);
  
  autoTable(doc, {
    startY: 125,
    head: [['Módulo', 'Retos Completados', 'Estado', 'Fecha última sesión']],
    body: data.wayBreakdown.map(w => [
      w.category,
      w.count.toString(),
      w.count > 5 ? 'Dominado' : w.count > 0 ? 'En progreso' : 'Pendiente',
      new Date().toLocaleDateString('es-ES'),
    ]),
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // ========== SECCIÓN 3: ANEXOS Y GENERALIZACIÓN ==========
  doc.addPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Adherencia a Anexos (Generalización al entorno natural)', 20, 25);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.text('Este apartado evalúa si los aprendizajes de la sesión se transfieren al hogar y al colegio.', 20, 35);
  
  autoTable(doc, {
    startY: 45,
    head: [['Día', 'Relajación (5 min)', 'Roleplay', 'Autocomprobación']],
    body: data.weeklyData.map(d => [
      d.day,
      d.relaxation ? '✅ Completado' : '❌ No registrado',
      d.roleplay ? '✅ Completado' : '❌ No registrado',
      d.selfcheck ? '✅ Completado' : '❌ No registrado',
    ]),
    theme: 'grid',
    headStyles: { fillColor: COLORS.secondary, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' },
    },
    styles: { fontSize: 10 },
  });

  // ========== SECCIÓN 4: PERFIL CONDUCTUAL ==========
  const lastTable = (doc as any).lastAutoTable;
  const tableEnd = lastTable ? lastTable.finalY : 120;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.text('4. Perfil Económico-Conductual', 20, tableEnd + 20);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  const econText = [
    `Perfil identificado: ${data.economicProfile.toUpperCase()}`,
    '',
    data.economicProfile.includes('Planificador') 
      ? 'El niño demuestra capacidad de delay de gratificación y control inhibitorio sólido. Se recomienda mantener el nivel de dificultad actual e introducir elecciones de mayor complejidad.'
      : data.economicProfile.includes('Impulsivo')
      ? 'Se observa alta impulsividad en la toma de decisiones de recompensa. Se sugiere trabajar la tolerancia a la frustración y establecer metas visuales de ahorro previo a la compra.'
      : 'Presenta un balance entre gratificación inmediata y planificación. Es un perfil saludable que permite continuar con la secuencia terapéutica estándar.',
  ].join('\n');
  
  doc.text(econText, 20, tableEnd + 35, { maxWidth: pageWidth - 40 });

  // ========== SECCIÓN 5: ALERTAS Y RECOMENDACIONES ==========
  doc.addPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.text('5. Alertas y Recomendaciones Clínicas', 20, 25);
  
  let alertY = 40;
  data.alerts.forEach((alert, i) => {
    const bgColor = alert.type === 'warning' ? [254, 243, 199] : alert.type === 'success' ? [209, 250, 229] : [219, 234, 254];
    const textColor = alert.type === 'warning' ? [146, 64, 14] : alert.type === 'success' ? [6, 95, 70] : [30, 64, 175];
    
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(20, alertY, pageWidth - 40, 20, 2, 2, 'F');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${alert.title}:`, 25, alertY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(alert.message, 25, alertY + 15);
    
    alertY += 28;
  });

  // ========== PIE DE PÁGINA Y FIRMA ==========
  const footerY = pageHeight - 40;
  doc.setDrawColor(...COLORS.light);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('WAY+ — Método de Gamificación en Habilidades Sociales', 20, footerY + 10);
  doc.text('Este informe ha sido generado automáticamente por la plataforma WAY+.', 20, footerY + 16);
  
  // Espacio para firma
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.text('Firma del terapeuta:', 20, footerY + 30);
  doc.line(70, footerY + 30, 160, footerY + 30);

  // Guardar
  doc.save(`WAY+_Informe_${data.patient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
}
