export interface SetLogRow {
  exercise_name: string;
  weight_kg: number;
  workout_logs: { logged_date: string } | { logged_date: string }[] | any;
}

export function calcWeightImproved(rows: SetLogRow[]): number {
  // Agrupar sets por ejercicio
  const byExercise = new Map<string, { date: string; weight: number }[]>();

  for (const row of rows) {
    const key = row.exercise_name;
    if (!key) continue;
    
    // Extraer logged_date controlando posibles estructuras anidadas de Supabase
    let loggedDate = '';
    if (row.workout_logs) {
      if (Array.isArray(row.workout_logs) && row.workout_logs.length > 0) {
        loggedDate = row.workout_logs[0].logged_date;
      } else if (typeof row.workout_logs === 'object') {
        loggedDate = (row.workout_logs as any).logged_date;
      }
    }
    
    if (!loggedDate) continue;

    const entry = { date: loggedDate, weight: row.weight_kg };
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key)!.push(entry);
  }

  let totalImprovement = 0;

  for (const [, sets] of byExercise) {
    // Ordenar por fecha (Supabase ya viene ordenado, pero por si acaso)
    sets.sort((a, b) => a.date.localeCompare(b.date));

    const totalSessions = sets.length;
    if (totalSessions < 2) continue;

    // "Primeras sesiones" = primer 33%, "últimas" = último 33%
    const slice = Math.max(1, Math.floor(totalSessions * 0.33));

    const earlyMax = Math.max(...sets.slice(0, slice).map(s => s.weight));
    const recentMax = Math.max(...sets.slice(-slice).map(s => s.weight));

    const delta = recentMax - earlyMax;
    if (delta > 0) totalImprovement += delta;
  }

  return Math.round(totalImprovement * 10) / 10; // 1 decimal
}
