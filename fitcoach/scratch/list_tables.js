const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function listTables() {
  // Query para listar tablas en public
  const { data, error } = await supabase
    .from('profiles') // necesitamos una tabla real para el select, pero probaremos RPC si existe
    .select('*')
    .limit(1);

  // No hay forma directa de listar tablas con Supabase JS sin RPC custom.
  // Pero puedo intentar tablas comunes.
  const commonTables = [
    'profiles', 'workout_logs', 'set_logs', 'exercises', 'routines', 
    'routine_days', 'assigned_routines', 'completed_days', 'invite_codes',
    'messages', 'notifications', 'weight_logs', 'client_details', 'progress_photos'
  ];

  for (const table of commonTables) {
    const { error: err } = await supabase.from(table).select('*').limit(1);
    if (!err || err.code !== 'PGRST205') {
      console.log(`TABLE_FOUND: ${table}`);
      if (!err) {
        // Log columns
        const { data: sample } = await supabase.from(table).select('*').limit(1);
        if (sample && sample[0]) console.log(`Columns for ${table}:`, Object.keys(sample[0]));
      }
    }
  }
}

listTables();
