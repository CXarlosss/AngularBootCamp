const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('--- CONFIGURANDO NUEVO ENTORNO MAESTRO ---');

  try {
    // 1. Obtener ID del Coach (asumimos que existe y es administrador)
    const { data: coaches } = await supabase.from('profiles').select('id').eq('role', 'coach').limit(1);
    const coachId = coaches[0]?.id;
    if (!coachId) throw new Error('No se encontró el perfil de Coach');

    // 2. Crear Rutina Maestra
    console.log('Creando Rutina "Cimientos 2026"...');
    const routineId = crypto.randomUUID();
    await supabase.from('routines').insert({
      id: routineId,
      name: 'Cimientos 2026',
      goal: 'hypertrophy',
      coach_id: coachId,
      is_template: true
    });

    // Dias y Ejercicios
    const d1 = crypto.randomUUID();
    const d2 = crypto.randomUUID();
    const d3 = crypto.randomUUID();

    await supabase.from('routine_days').insert([
      { id: d1, routine_id: routineId, day_number: 1, label: 'Lunes: Empuje' },
      { id: d2, routine_id: routineId, day_number: 3, label: 'Miércoles: Tirón' },
      { id: d3, routine_id: routineId, day_number: 5, label: 'Viernes: Pierna' }
    ]);

    await supabase.from('routine_exercises').insert([
      // Lunes
      { id: crypto.randomUUID(), day_id: d1, exercise_name: 'Press de Banca', sets: 4, reps: '8-12', rest_seconds: 90 },
      { id: crypto.randomUUID(), day_id: d1, exercise_name: 'Press Militar', sets: 3, reps: '10-12', rest_seconds: 90 },
      { id: crypto.randomUUID(), day_id: d1, exercise_name: 'Extensión Tríceps', sets: 3, reps: '15', rest_seconds: 60 },
      // Miercoles
      { id: crypto.randomUUID(), day_id: d2, exercise_name: 'Jalón al Pecho', sets: 4, reps: '10-12', rest_seconds: 90 },
      { id: crypto.randomUUID(), day_id: d2, exercise_name: 'Remo con Mancuerna', sets: 3, reps: '12', rest_seconds: 90 },
      { id: crypto.randomUUID(), day_id: d2, exercise_name: 'Curl Martillo', sets: 3, reps: '12', rest_seconds: 60 },
      // Viernes
      { id: crypto.randomUUID(), day_id: d3, exercise_name: 'Sentadilla Goblet', sets: 4, reps: '12', rest_seconds: 120 },
      { id: crypto.randomUUID(), day_id: d3, exercise_name: 'Peso Muerto Rumano', sets: 3, reps: '12', rest_seconds: 120 },
      { id: crypto.randomUUID(), day_id: d3, exercise_name: 'Zancadas', sets: 3, reps: '10/lado', rest_seconds: 90 }
    ]);

    // 3. Crear Código de Invitación
    console.log('Generando código FITCOACH-2026...');
    await supabase.from('invite_codes').insert({
      code: 'FITCOACH-2026',
      coach_id: coachId,
      status: 'active'
    });

    console.log('--- CONFIGURACIÓN MAESTRA COMPLETADA ---');
    console.log('Código: FITCOACH-2026');
    console.log('Cliente: Registra uno nuevo con ese código.');
  } catch (e) {
    console.error('Error durante el setup:', e);
  }
}

setup();
