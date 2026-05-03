const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log('--- INICIANDO LIMPIEZA MAESTRA ---');

  try {
    // 1. Logs
    console.log('1. Borrando workout_logs...');
    await supabase.from('workout_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Asignaciones
    console.log('2. Borrando assigned_routines...');
    await supabase.from('assigned_routines').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Ejercicios de rutina
    console.log('3. Borrando routine_exercises...');
    await supabase.from('routine_exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 4. Dias de rutina
    console.log('4. Borrando routine_days...');
    await supabase.from('routine_days').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 5. Rutinas
    console.log('5. Borrando routines...');
    await supabase.from('routines').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 6. Códigos de invitación (liberar FKs)
    console.log('6. Borrando invite_codes...');
    await supabase.from('invite_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 7. Perfiles clientes
    console.log('7. Borrando clientes...');
    await supabase.from('profiles').delete().eq('role', 'client');

    console.log('--- BASE DE DATOS LIMPIA: LISTA PARA EMPEZAR DE CERO ---');
  } catch (e) {
    console.error('Error durante la limpieza:', e);
  }
}

clean();
