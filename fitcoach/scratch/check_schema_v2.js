const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkWorkoutLogs() {
  // Intentar obtener las columnas de workout_logs aunque no haya datos
  const { data, error } = await supabase.rpc('get_columns', { table_name: 'workout_logs' });
  // Si no hay RPC, intentar una query que falle pero de info o simplemente insertar y borrar
  
  const { data: sample, error: err } = await supabase.from('workout_logs').select('*').limit(1);
  if (err) {
    console.error('Error selecting workout_logs:', err);
  } else {
    console.log('Workout Logs Sample Data:', sample);
    if (sample.length > 0) {
      console.log('Workout Logs Columns:', Object.keys(sample[0]));
    } else {
      console.log('No data in workout_logs, checking profiles for clues...');
      const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
      console.log('Profiles Columns:', Object.keys(profiles[0]));
    }
  }
}

checkWorkoutLogs();
