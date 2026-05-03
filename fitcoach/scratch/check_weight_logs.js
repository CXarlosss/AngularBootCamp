const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkWeightLogs() {
  const { data, error } = await supabase.from('weight_logs').select('*').limit(1);
  if (error && error.message.includes('relation "weight_logs" does not exist')) {
    console.log('TABLE_MISSING');
  } else if (error) {
    console.error(error);
  } else {
    console.log('TABLE_EXISTS');
  }
}

checkWeightLogs();
