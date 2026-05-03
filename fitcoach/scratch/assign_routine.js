const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function assignRoutine() {
  const clientId = '39756ada-3024-4b3f-988a-53771d9111ee';
  
  // 1. Find any routine
  const { data: routines } = await supabase.from('routines').select('id, coach_id').limit(1);
  if (!routines || routines.length === 0) {
    console.error('No routines found in DB');
    return;
  }
  const routineId = routines[0].id;
  const coachId = routines[0].coach_id;

  console.log(`Assigning routine ${routineId} to client ${clientId}`);

  // 2. Assign it
  const { error } = await supabase.from('assigned_routines').insert({
    client_id: clientId,
    routine_id: routineId,
    coach_id: coachId,
    status: 'active'
  });

  if (error) {
    console.error('Error assigning routine:', error);
  } else {
    console.log('Routine assigned successfully!');
  }
}

assignRoutine();
