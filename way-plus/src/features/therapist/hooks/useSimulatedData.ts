export type PatientProfile = 'carlos' | 'ana' | 'lucas';

export function useSimulatedData(profile: PatientProfile) {
  const profiles = {
    carlos: {
      name: 'Carlos (Estable)',
      racha: 12,
      lastSession: 'Hoy, 11:30',
      radar: [
        { subject: 'Relajación', current: 80, past: 60, avg: 70 },
        { subject: 'Autonomía', current: 85, past: 65, avg: 65 },
        { subject: 'Social', current: 75, past: 55, avg: 60 },
        { subject: 'Asertividad', current: 70, past: 50, avg: 55 },
        { subject: 'Ejecutivo', current: 90, past: 70, avg: 65 },
      ],
      progress: [
        { week: 'Sem 1', ways: 2, xp: 200 },
        { week: 'Sem 2', ways: 3, xp: 450 },
        { week: 'Sem 3', ways: 3, xp: 700 },
        { week: 'Sem 4', ways: 4, xp: 1050 },
        { week: 'Sem 5', ways: 5, xp: 1400 },
        { week: 'Sem 6', ways: 4, xp: 1800 },
        { week: 'Sem 7', ways: 5, xp: 2250 },
        { week: 'Sem 8', ways: 6, xp: 2890 },
      ],
      economy: [
        { name: 'Misiones', ingresos: 500, gastos: 0 },
        { name: 'Cofres', ingresos: 300, gastos: 0 },
        { name: 'Racha', ingresos: 200, gastos: 0 },
        { name: 'Tienda', ingresos: 0, gastos: 300 }, // Ahorrador
      ],
      funnel: [
        { name: 'Iniciados', value: 100 },
        { name: 'Completados', value: 85 },
        { name: 'Recompensa Extra', value: 60 },
      ],
      heatmap: generateHeatmap('carlos')
    },
    ana: {
      name: 'Ana (Desequilibrada / Gastadora)',
      racha: 3,
      lastSession: 'Ayer, 18:00',
      radar: [
        { subject: 'Relajación', current: 95, past: 80, avg: 70 },
        { subject: 'Autonomía', current: 60, past: 50, avg: 65 },
        { subject: 'Social', current: 40, past: 35, avg: 60 },
        { subject: 'Asertividad', current: 50, past: 45, avg: 55 },
        { subject: 'Ejecutivo', current: 80, past: 70, avg: 65 },
      ],
      progress: [
        { week: 'Sem 1', ways: 5, xp: 500 },
        { week: 'Sem 2', ways: 8, xp: 1300 },
        { week: 'Sem 3', ways: 7, xp: 2000 },
        { week: 'Sem 4', ways: 9, xp: 2900 },
        { week: 'Sem 5', ways: 2, xp: 3100 },
        { week: 'Sem 6', ways: 3, xp: 3400 },
        { week: 'Sem 7', ways: 8, xp: 4200 },
        { week: 'Sem 8', ways: 9, xp: 5100 },
      ],
      economy: [
        { name: 'Misiones', ingresos: 800, gastos: 0 },
        { name: 'Cofres', ingresos: 400, gastos: 0 },
        { name: 'Racha', ingresos: 50, gastos: 0 },
        { name: 'Tienda', ingresos: 0, gastos: 1100 }, // Gastadora
      ],
      funnel: [
        { name: 'Iniciados', value: 150 },
        { name: 'Completados', value: 120 },
        { name: 'Recompensa Extra', value: 40 },
      ],
      heatmap: generateHeatmap('ana')
    },
    lucas: {
      name: 'Lucas (En Riesgo)',
      racha: 0,
      lastSession: 'Hace 5 días',
      radar: [
        { subject: 'Relajación', current: 20, past: 40, avg: 70 },
        { subject: 'Autonomía', current: 40, past: 45, avg: 65 },
        { subject: 'Social', current: 30, past: 30, avg: 60 },
        { subject: 'Asertividad', current: 25, past: 35, avg: 55 },
        { subject: 'Ejecutivo', current: 45, past: 50, avg: 65 },
      ],
      progress: [
        { week: 'Sem 1', ways: 3, xp: 300 },
        { week: 'Sem 2', ways: 2, xp: 500 },
        { week: 'Sem 3', ways: 1, xp: 600 },
        { week: 'Sem 4', ways: 0, xp: 600 },
        { week: 'Sem 5', ways: 2, xp: 800 },
        { week: 'Sem 6', ways: 1, xp: 900 },
        { week: 'Sem 7', ways: 0, xp: 900 },
        { week: 'Sem 8', ways: 0, xp: 900 },
      ],
      economy: [
        { name: 'Misiones', ingresos: 150, gastos: 0 },
        { name: 'Cofres', ingresos: 50, gastos: 0 },
        { name: 'Racha', ingresos: 0, gastos: 0 },
        { name: 'Tienda', ingresos: 0, gastos: 100 },
      ],
      funnel: [
        { name: 'Iniciados', value: 40 },
        { name: 'Completados', value: 15 }, // Abandono altísimo
        { name: 'Recompensa Extra', value: 2 },
      ],
      heatmap: generateHeatmap('lucas')
    }
  };

  return profiles[profile];
}

function generateHeatmap(profile: PatientProfile) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = [15, 16, 17, 18, 19, 20]; // Simplificamos de 15h a 20h para no hacer el grid gigante
  const data = [];

  for (let d = 0; d < days.length; d++) {
    for (let h = 0; h < hours.length; h++) {
      let value = 0;
      if (profile === 'carlos' && hours[h] === 17) value = Math.floor(Math.random() * 5) + 3; // Rutina a las 17h
      if (profile === 'ana' && (days[d] === 'Sáb' || days[d] === 'Dom')) value = Math.floor(Math.random() * 8) + 2; // Fines de semana
      if (profile === 'lucas') value = Math.random() > 0.8 ? 1 : 0; // Poca actividad, esporádica

      data.push({
        day: days[d],
        hour: `${hours[h]}:00`,
        dayIndex: d,
        hourIndex: h,
        value: value
      });
    }
  }
  return data;
}
