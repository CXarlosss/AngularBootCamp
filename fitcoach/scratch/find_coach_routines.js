const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findCoachData() {
  // Find a coach
  const { data: coaches, error: cErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'coach')
    .limit(1);

  if (cErr) {
    console.error('Error finding coach:', cErr);
    return;
  }
  const coach = coaches[0];
  console.log('Coach:', coach);

  // Find routines by this coach
  const { data: routines, error: rErr } = await supabase
    .from('routines')
    .select('id, name')
    .eq('coach_id', coach.id)
    .limit(1);

  if (rErr) {
    console.error('Error finding routines:', rErr);
    return;
  }
  console.log('Routines:', routines);
}

findCoachData();
