const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const COACH_ID = '8721d5a8-55ec-48b3-b16d-7e054af6d4b0';
const CLIENT_ID = '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b';

async function createMasterRoutine() {
  console.log('--- GENERANDO DÍA 1 (TORSO POWER) ---');

  try {
    const routineId = crypto.randomUUID();
    await supabase.from('routines').insert({
      id: routineId,
      name: 'Torso Power & Hypertrophy',
      goal: 'strength_hypertrophy',
      coach_id: COACH_ID,
      is_template: true
    });

    const d1 = crypto.randomUUID();
    await supabase.from('routine_days').insert({
      id: d1,
      routine_id: routineId,
      day_number: 1,
      label: 'Día 1: Torso (Empuje/Tirón)'
    });

    const exercises = [
      { name: 'Remo o bici suave', sets: 1, reps: '5 min', rest: 60, notes: 'Activación general' },
      { name: 'Band pull-parts', sets: 2, reps: '15', rest: 30, notes: 'Activación escapular' },
      { name: 'Dominadas sin lastre', sets: 2, reps: '5', rest: 60, notes: 'RPE 6' },
      { name: 'Fondos sin lastre', sets: 1, reps: '5', rest: 60, notes: 'Activación codo/hombro' },
      { name: 'Dominadas lastradas', sets: 4, reps: '5', rest: 180, notes: 'Serie pesada 10kg' },
      { name: 'Fondos lastrados (Carga)', sets: 4, reps: '6', rest: 180, notes: '10kg - 15kg' },
      { name: 'Fondos lastrados (Control)', sets: 3, reps: '8', rest: 150, notes: 'Control profundo' },
      { name: 'Press inclinado mcs.', sets: 3, reps: '8-10', rest: 90, notes: 'Mantener o subir peso' },
      { name: 'Remo máq. neutro', sets: 3, reps: '8-10', rest: 90, notes: 'Intentar 10 reps' },
      { name: 'Jalón al pecho neutro', sets: 3, reps: '10', rest: 75, notes: 'Rango alto' },
      { name: 'Press pecho máquina', sets: 3, reps: '10', rest: 75, notes: 'Sin bloqueo agresivo' },
      { name: 'Jalón Unilateral', sets: 3, reps: '8', rest: 45, notes: 'Control profundo' },
      { name: 'Pull Over', sets: 2, reps: '15', rest: 45, notes: 'Movimiento limpio' },
      { name: 'Flexiones controladas', sets: 3, reps: 'AMRAP', rest: 60, notes: 'Superar reps Sem 3' }
    ];

    for (const ex of exercises) {
      await supabase.from('routine_exercises').insert({
        id: crypto.randomUUID(),
        day_id: d1,
        exercise_name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest,
        notes: ex.notes
      });
    }

    await supabase.from('assigned_routines').insert({
      id: crypto.randomUUID(),
      routine_id: routineId,
      client_id: CLIENT_ID,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    console.log('--- DÍA 1 CARGADO Y ASIGNADO A OSCAR ---');
  } catch (e) {
    console.error('Fallo en el despliegue:', e);
  }
}

createMasterRoutine();
