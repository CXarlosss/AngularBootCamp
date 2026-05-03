const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkCompletedDaysCols() {
  const { data, error } = await supabase.from('completed_days').select('*').limit(1);
  if (error) {
    // If table is empty but exists, error might be null or PGRST204 if columns are missing in query
    console.log('Error checking columns:', error);
  } else {
    console.log('Columns in completed_days:', data.length > 0 ? Object.keys(data[0]) : 'Table empty');
  }
}

checkCompletedDaysCols();
