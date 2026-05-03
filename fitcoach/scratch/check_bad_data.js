const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function check() {
  const { data, error } = await supabase
    .from('set_logs')
    .select(`
      weight_kg, reps_done, exercise_name,
      workout_logs!inner ( logged_date, client_id )
    `)
    .limit(1000);

  if (error) {
    console.error(error);
    return;
  }

  const badRows = data.filter(r => r.weight_kg > 1000000 || r.weight_kg < -1000000);
  console.log('Bad rows found:', badRows.length);
  if (badRows.length > 0) {
    console.log('Sample bad row:', badRows[0]);
  } else {
    console.log('No extremely large weights found in DB.');
    // Check if any weight is a string that could be coerced weirdly
    const weird = data.filter(r => typeof r.weight_kg !== 'number');
    console.log('Non-number weights:', weird.length);
  }
}
check();
