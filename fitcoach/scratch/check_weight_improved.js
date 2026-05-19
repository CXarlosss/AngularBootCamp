const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Copiamos la lógica exacta de calcWeightImproved de progress.utils.ts
function calcWeightImproved(rows) {
  if (!rows || rows.length === 0) return 0;

  const groups = {};

  for (const row of rows) {
    if (row.weight_kg === null || row.weight_kg === undefined) continue;

    let rawDate = null;
    if (row.workout_logs) {
      if (Array.isArray(row.workout_logs)) {
        rawDate = row.workout_logs[0]?.logged_date || null;
      } else {
        rawDate = row.workout_logs.logged_date || null;
      }
    }

    if (!rawDate) continue;

    const date = new Date(rawDate);
    const exercise = row.exercise_name;

    if (!groups[exercise]) {
      groups[exercise] = [];
    }
    groups[exercise].push({ weight: row.weight_kg, date });
  }

  let totalImprovement = 0;

  for (const exerciseName in groups) {
    const list = groups[exerciseName];

    const sessionsMap = {};
    for (const item of list) {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!sessionsMap[dateStr]) {
        sessionsMap[dateStr] = [];
      }
      sessionsMap[dateStr].push(item.weight);
    }

    const uniqueDates = Object.keys(sessionsMap).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const totalSessions = uniqueDates.length;
    if (totalSessions < 2) continue;

    const sliceSize = Math.max(1, Math.floor(totalSessions * 0.33));

    const earlyDates = uniqueDates.slice(0, sliceSize);
    const recentDates = uniqueDates.slice(-sliceSize);

    const earlyWeights = [];
    for (const d of earlyDates) {
      earlyWeights.push(...sessionsMap[d]);
    }

    const recentWeights = [];
    for (const d of recentDates) {
      recentWeights.push(...sessionsMap[d]);
    }

    if (earlyWeights.length === 0 || recentWeights.length === 0) continue;

    const earlyMax = Math.max(...earlyWeights);
    const recentMax = Math.max(...recentWeights);

    const diff = recentMax - earlyMax;
    if (diff > 0) {
      totalImprovement += diff;
    }
  }

  return Number(totalImprovement.toFixed(1));
}

async function validate() {
  console.log('--- VALIDANDO CLIENTES Y SUS MEJORAS ---');

  // Obtener los clientes que tienen logs de entrenamiento completados
  const { data: clients, error: cError } = await supabase
    .from('workout_logs')
    .select('client_id')
    .eq('completed', true);

  if (cError) {
    console.error('Error fetching clients:', cError);
    return;
  }

  const clientIds = [...new Set(clients.map(c => c.client_id))];
  console.log(`Clientes únicos con entrenamientos completados: ${clientIds.length}`);

  for (const clientId of clientIds) {
    // Traer todos los sets del cliente
    const { data: sets, error: sError } = await supabase
      .from('set_logs')
      .select(`
        exercise_name,
        weight_kg,
        workout_logs!inner (
          client_id,
          logged_date,
          completed
        )
      `)
      .eq('workout_logs.client_id', clientId)
      .eq('workout_logs.completed', true)
      .not('weight_kg', 'is', null);

    if (sError) {
      console.error(`Error fetching sets for client ${clientId}:`, sError);
      continue;
    }

    const improvement = calcWeightImproved(sets);
    console.log(`Cliente ID: ${clientId}`);
    console.log(`  -> Sets registrados: ${sets.length}`);
    console.log(`  -> Kg Mejorados (TypeScript): ${improvement} kg`);
    console.log('----------------------------------------');
  }
}

validate();
