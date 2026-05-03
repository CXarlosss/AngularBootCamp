const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkSetLogsColumns() {
  // Instead of information_schema (which anon can't access usually), we do a select * limit 0
  const { data, error } = await supabase.from('set_logs').select('*').limit(1);
  if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    console.log('Columns in set_logs:', cols.filter(c => ['weight_kg', 'weight', 'reps_done', 'reps'].includes(c)));
  } else {
    // Try to get columns by inserting a failing row or just select * on an empty table
    const { data: emptyData, error: emptyError } = await supabase.from('set_logs').select('*').limit(0);
    console.log('Columns (empty table):', emptyData); // sometimes returns columns in some drivers
  }
}

async function checkCompletedDays() {
  const { data, error } = await supabase.from('completed_days').select('*').limit(1);
  if (error) {
    console.log('Error in completed_days:', error.message);
  } else {
    console.log('completed_days columns:', data.length > 0 ? Object.keys(data[0]) : 'exists but empty');
  }
}

checkSetLogsColumns();
checkCompletedDays();
