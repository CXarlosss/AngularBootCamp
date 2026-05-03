const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.error(error);
    return;
  }
  console.log('Set Logs Columns:', Object.keys(data[0] || {}));

  const { data: logs, error: lErr } = await supabase
    .from('workout_logs')
    .select('*')
    .limit(1);
    
  if (lErr) console.error(lErr);
  else console.log('Workout Logs Columns:', Object.keys(logs[0] || {}));
}

checkSchema();
