const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function findIds() {
  const { data: coaches, error: cErr } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'coach')
    .limit(1);

  if (cErr) {
    console.error('Error finding coach:', cErr);
    return;
  }

  const { data: clients, error: clErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, coach_id')
    .eq('role', 'client')
    .limit(1);

  if (clErr) {
    console.error('Error finding client:', clErr);
    return;
  }

  console.log('Coach:', coaches[0]);
  console.log('Client:', clients[0]);
}

findIds();
