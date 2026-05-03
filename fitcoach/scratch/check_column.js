const { createClient } = require('@supabase/supabase-js');

// Usamos la clave de servicio si la tenemos, pero aquí solo tenemos la anon key.
// Con la anon key no podemos hacer ALTER TABLE.
// El usuario deberá hacerlo él mismo en el panel de Supabase.
// Sin embargo, puedo intentar ver si existe.

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkDurationColumn() {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('duration_seconds')
    .limit(1);

  if (error && error.message.includes('column "duration_seconds" does not exist')) {
    console.log('COLUMN_MISSING');
  } else if (error) {
    console.error('Error checking column:', error);
  } else {
    console.log('COLUMN_EXISTS');
  }
}

checkDurationColumn();
