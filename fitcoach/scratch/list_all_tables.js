const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkAllTables() {
  const { data, error } = await supabase.rpc('get_tables'); // If this RPC exists
  if (error) {
    // Fallback: use a common query to list tables if possible
    console.log('RPC get_tables failed, trying raw query...');
    const { data: tables, error: err2 } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');
    
    if (err2) {
      console.log('Failed to list tables:', err2);
    } else {
      console.log('Tables in public schema:', tables.map(t => t.table_name));
    }
  } else {
    console.log('Tables:', data);
  }
}

checkAllTables();
