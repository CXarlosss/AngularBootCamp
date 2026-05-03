const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkColumns() {
  // We can't query information_schema easily, so we just select one row and check keys
  const { data, error } = await supabase.from('set_logs').select('*').limit(1).single();
  if (error) {
    console.error('Error fetching set_logs:', error);
  } else {
    console.log('Columns in set_logs:', Object.keys(data));
  }
}

checkColumns();
