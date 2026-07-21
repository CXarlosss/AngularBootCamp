import { format } from 'date-fns';

interface PatientData {
  name: string;
  age: number;
  currentLevel: string;
  coins: number;
  completedWays: string[];
  inventory: string[];
}

/**
 * Genera un informe clínico en PDF para un paciente.
 */
export const generatePatientReport = async (patient: PatientData, logs: any[]) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

  // 1. Cabecera Premium
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME CLÍNICO WAY+', 20, 25);
  
  doc.setFontSize(10);
  doc.text(`Generado el: ${dateStr}`, 150, 25);

  // 2. Información del Paciente
  doc.setTextColor(30, 27, 75); // Indigo 900
  doc.setFontSize(16);
  doc.text('Datos del Paciente', 20, 55);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const patientInfo = [
    [`Nombre: ${patient.name}`, `Edad: ${patient.age} años`],
    [`Nivel Actual: ${patient.currentLevel.toUpperCase()}`, `Monedas: ${patient.coins}`],
    [`Retos Completados: ${patient.completedWays.length}`, `Objetos en Inventario: ${patient.inventory.length}`]
  ];

  autoTable(doc, {
    startY: 60,
    head: [],
    body: patientInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 }
  });

  // 3. Resumen de Actividad
  const startY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Actividad Reciente', 20, startY);

  const tableData = logs.map(log => [
    format(new Date(log.created_at), 'dd/MM/yyyy'),
    log.way_id.replace('way-', '').toUpperCase(),
    log.action === 'way_completed' ? 'COMPLETADO' : log.action,
    `${(log.metadata?.timeSpentMs / 1000 / 60).toFixed(1)} min`,
    log.metadata?.isHomework ? 'SÍ' : 'NO'
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [['Fecha', 'Reto', 'Estado', 'Tiempo', 'Tarea']],
    body: tableData,
    headStyles: { fillColor: [79, 70, 229], halign: 'center' },
    styles: { halign: 'center', fontSize: 9 },
    columnStyles: { 1: { halign: 'left' } }
  });

  // 4. Conclusiones y Firma
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  if (finalY < 250) {
    doc.setFontSize(12);
    doc.text('Observaciones Clínicas:', 20, finalY);
    doc.line(20, finalY + 5, 190, finalY + 5);
    doc.line(20, finalY + 15, 190, finalY + 15);
    doc.line(20, finalY + 25, 190, finalY + 25);
    
    doc.setFontSize(10);
    doc.text('Firma del Terapeuta', 150, finalY + 45);
    doc.line(140, finalY + 40, 190, finalY + 40);
  }

  // Guardar PDF
  doc.save(`Informe_WAY_${patient.name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
