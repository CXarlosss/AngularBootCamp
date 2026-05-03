const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function inspectSchema() {
  // Con el anon key no podemos consultar information_schema.tables.
  // Pero podemos intentar un RPC si el usuario creó uno.
  // Si no, probaremos nombres específicos de nuevo pero con más cuidado.
  
  const tables = [
    'progress_photos',
    'weight_logs',
    'client_details',
    'exercises',
    'routine_days',
    'routines',
    'set_logs',
    'workout_logs',
    'profiles'
  ];

  for (const t of tables) {
    const { error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${t}: ${error.code} - ${error.message}`);
    } else {
      console.log(`Table ${t}: FOUND`);
      const { data } = await supabase.from(t).select('*').limit(1);
      if (data && data[0]) console.log(`  Columns: ${Object.keys(data[0])}`);
      else console.log(`  Table is empty`);
    }
  }
}

inspectSchema();
