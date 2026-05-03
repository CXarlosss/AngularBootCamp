const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestData() {
  const oscarId = '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b';
  
  // 1. Find a coach to own the routine
  const { data: coaches } = await supabase.from('profiles').select('id').eq('role', 'coach').limit(1);
  if (!coaches || coaches.length === 0) {
    console.error('No coach found to create routine');
    return;
  }
  const coachId = coaches[0].id;

  // 2. Create a routine
  const routineId = crypto.randomUUID();
  console.log('Creating routine:', routineId);
  await supabase.from('routines').insert({
    id: routineId,
    name: 'Rutina de Prueba Antigravity',
    goal: 'Test de Logs',
    coach_id: coachId,
    is_template: true
  });

  // 3. Create a day for the routine
  const dayId = crypto.randomUUID();
  console.log('Creating day:', dayId);
  await supabase.from('routine_days').insert({
    id: dayId,
    routine_id: routineId,
    day_number: 1,
    label: 'Día 1'
  });

  // 4. Create an exercise for the day
  console.log('Creating exercise');
  await supabase.from('routine_exercises').insert({
    id: crypto.randomUUID(),
    day_id: dayId,
    exercise_name: 'Press de Banca',
    sets: 3,
    reps: 10,
    target_weight: 60,
    rest_seconds: 90
  });

  // 5. Assign to Oscar
  console.log('Assigning to Oscar');
  await supabase.from('assigned_routines').insert({
    id: crypto.randomUUID(),
    client_id: oscarId,
    routine_id: routineId,
    coach_id: coachId,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0]
  });

  console.log('Done!');
}

setupTestData();
