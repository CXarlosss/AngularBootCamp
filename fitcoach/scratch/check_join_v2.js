const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function check() {
  const { data, error } = await supabase
    .from('set_logs')
    .select(`
      exercise_name,
      workout_logs ( logged_date )
    `)
    .limit(1);

  if (error) {
    console.error('Error with workout_logs:', error);
    const { data: data2, error: error2 } = await supabase
      .from('set_logs')
      .select(`
        exercise_name,
        workout_log:workout_logs ( logged_date )
      `)
      .limit(1);
    console.log('Result with rename:', data2, error2);
  } else {
    console.log('Result with workout_logs:', data);
  }
}
check();
