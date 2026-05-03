const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkCols() {
  // Try to select common column names to see which one errors
  const testCols = ['user_id', 'client_id', 'completed_at', 'logged_date'];
  for (const col of testCols) {
    const { error } = await supabase.from('completed_days').select(col).limit(1);
    if (error) {
      console.log(`Column ${col} does NOT exist: ${error.message}`);
    } else {
      console.log(`Column ${col} EXISTS`);
    }
  }
}

checkCols();
