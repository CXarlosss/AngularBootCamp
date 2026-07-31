/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useTherapistReport — Genera datos estructurados para PDF
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useMemo } from 'react';

export interface ReportSession {
  date: string;
  durationMinutes: number;
  levelsCompleted: number;
  levelsAttempted: number;
  avgScore: number;
  frustrationEvents: number;
  helpRequests: number;
}

export interface ReportData {
  patientName: string;
  patientAge: number;
  therapistName: string;
  reportPeriod: string;
  generatedAt: string;
  summary: {
    totalSessions: number;
    totalPlayTimeHours: number;
    avgSessionMinutes: number;
    completionRate: number;
    adherenceScore: number;
    streakCurrent: number;
    streakMax: number;
  };
  evolution: {
    weekOverWeekChange: number;
    frustrationTrend: 'improving' | 'stable' | 'worsening';
    recommendedNextSteps: string[];
  };
  sessions: ReportSession[];
  milestones: { date: string; title: string; description: string }[];
}

export function useTherapistReport(patientId: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  // En producción, esto vendría de PostHog API o tu backend
  const reportData: ReportData = useMemo(
    () => ({
      patientName: 'Lucía Martínez',
      patientAge: 7,
      therapistName: 'Dra. Elena García',
      reportPeriod: '1 - 31 de julio 2026',
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: 24,
        totalPlayTimeHours: 4.8,
        avgSessionMinutes: 12,
        completionRate: 78,
        adherenceScore: 85,
        streakCurrent: 5,
        streakMax: 12,
      },
      evolution: {
        weekOverWeekChange: +15,
        frustrationTrend: 'improving',
        recommendedNextSteps: [
          'Continuar con Niveles 4-5 (dificultad media-alta)',
          'Introducir Modo Zen 2 veces por semana para regulación',
          'Reforzar con recompensas visuales inmediatas',
        ],
      },
      sessions: [
        {
          date: '2026-07-31',
          durationMinutes: 15,
          levelsCompleted: 2,
          levelsAttempted: 3,
          avgScore: 82,
          frustrationEvents: 1,
          helpRequests: 0,
        },
        {
          date: '2026-07-30',
          durationMinutes: 10,
          levelsCompleted: 1,
          levelsAttempted: 2,
          avgScore: 75,
          frustrationEvents: 2,
          helpRequests: 1,
        },
        {
          date: '2026-07-29',
          durationMinutes: 12,
          levelsCompleted: 2,
          levelsAttempted: 2,
          avgScore: 90,
          frustrationEvents: 0,
          helpRequests: 0,
        },
      ],
      milestones: [
        {
          date: '2026-07-15',
          title: 'Racha de 7 días',
          description: 'Primer logro de consistencia',
        },
        {
          date: '2026-07-22',
          title: 'Nivel 5 completado',
          description: 'Superó el Bosque Encantado sin ayuda',
        },
      ],
    }),
    [patientId]
  );

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Import dinámico de jsPDF para no cargar en el bundle inicial
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const d = reportData;

      // ─── HEADER ───
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('WAY+', 20, 25);
      doc.setFontSize(12);
      doc.text('Informe de progreso terapéutico', 20, 32);

      // ─── INFO ───
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.text(`Paciente: ${d.patientName} (${d.patientAge} años)`, 20, 55);
      doc.text(`Terapeuta: ${d.therapistName}`, 20, 62);
      doc.text(`Período: ${d.reportPeriod}`, 20, 69);
      doc.text(`Generado: ${new Date(d.generatedAt).toLocaleDateString('es')}`, 20, 76);

      // ─── SUMMARY BOXES ───
      const boxes = [
        { label: 'Sesiones', value: String(d.summary.totalSessions), x: 20 },
        { label: 'Tiempo total', value: `${d.summary.totalPlayTimeHours}h`, x: 70 },
        { label: 'Completados', value: `${d.summary.completionRate}%`, x: 120 },
        { label: 'Adherencia', value: `${d.summary.adherenceScore}%`, x: 165 },
      ];

      boxes.forEach((box) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(box.x, 85, 40, 25, 3, 3, 'F');
        doc.setTextColor(79, 70, 229);
        doc.setFontSize(14);
        doc.text(box.value, box.x + 20, 100, { align: 'center' });
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text(box.label, box.x + 20, 107, { align: 'center' });
      });

      // ─── EVOLUTION ───
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text('Evolución y recomendaciones', 20, 125);

      const trendColor =
        d.evolution.frustrationTrend === 'improving'
          ? [16, 185, 129]
          : d.evolution.frustrationTrend === 'stable'
            ? [99, 102, 241]
            : [244, 63, 94];

      doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
      doc.setFontSize(11);
      doc.text(
        `Tendencia: ${
          d.evolution.frustrationTrend === 'improving'
            ? 'Mejorando'
            : d.evolution.frustrationTrend === 'stable'
              ? 'Estable'
              : 'Requiere atención'
        } (${d.evolution.weekOverWeekChange > 0 ? '+' : ''}${d.evolution.weekOverWeekChange}%)`,
        20,
        135
      );

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      let y = 145;
      d.evolution.recommendedNextSteps.forEach((step, i) => {
        doc.text(`${i + 1}. ${step}`, 25, y);
        y += 7;
      });

      // ─── SESSIONS TABLE ───
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text('Registro de sesiones', 20, y + 10);

      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(20, y + 15, 170, 8, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.text('Fecha', 22, y + 21);
      doc.text('Dur.', 55, y + 21);
      doc.text('Niveles', 75, y + 21);
      doc.text('Puntuación', 105, y + 21);
      doc.text('Frust.', 140, y + 21);

      // Table rows
      doc.setTextColor(30, 41, 59);
      let rowY = y + 30;
      d.sessions.forEach((session) => {
        doc.text(new Date(session.date).toLocaleDateString('es'), 22, rowY);
        doc.text(`${session.durationMinutes}m`, 55, rowY);
        doc.text(`${session.levelsCompleted}/${session.levelsAttempted}`, 75, rowY);
        doc.text(`${session.avgScore}%`, 105, rowY);
        doc.text(String(session.frustrationEvents), 140, rowY);
        rowY += 7;
      });

      // ─── MILESTONES ───
      rowY += 5;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text('Logros alcanzados', 20, rowY);
      rowY += 10;

      d.milestones.forEach((m) => {
        doc.setTextColor(245, 158, 11);
        doc.setFontSize(10);
        doc.text(`★ ${m.title}`, 25, rowY);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text(`${new Date(m.date).toLocaleDateString('es')} — ${m.description}`, 25, rowY + 5);
        rowY += 12;
      });

      // ─── FOOTER ───
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('WAY+ — Plataforma de terapia infantil gamificada', 105, 285, { align: 'center' });
      doc.text('Este informe es confidencial y está destinado exclusivamente al uso terapéutico.', 105, 290, {
        align: 'center',
      });

      doc.save(`WAY+_Informe_${d.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  }, [reportData]);

  return { reportData, generatePDF, isGenerating };
}
