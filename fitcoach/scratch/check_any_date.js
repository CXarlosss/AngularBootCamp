const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkAnyDate() {
  const { data, error } = await supabase.from('set_logs').select('completed_at').not('completed_at', 'is', null).limit(1);
  if (data && data.length > 0) {
    console.log('Found a set with date:', data[0].completed_at);
  } else {
    console.log('NO sets have completed_at value');
  }
}

checkAnyDate();
