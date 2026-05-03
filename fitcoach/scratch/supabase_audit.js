const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function runAudit() {
  console.log('--- AUDIT RESULTS ---');
  
  // Query 1: completed_days
  const { data: q1, error: e1 } = await supabase.from('completed_days').select('*').limit(3);
  console.log('Q1 (completed_days):', q1 || e1?.message);

  // Query 2: workout_logs
  const { data: q2, error: e2 } = await supabase.from('workout_logs').select('*').limit(3);
  console.log('Q2 (workout_logs):', q2 || e2?.message);

  // Query 3: set_logs
  const { data: q3, error: e3 } = await supabase.from('set_logs').select('*').limit(3);
  console.log('Q3 (set_logs):', q3 || e3?.message);

  // Query 4: Columns for set_logs
  // Since we can't easily query information_schema, we check keys of a result
  if (q3 && q3.length > 0) {
    console.log('Q4 (set_logs columns):', Object.keys(q3[0]));
  } else {
    console.log('Q4 (set_logs columns): Unable to fetch columns (table empty)');
  }
}

runAudit();
