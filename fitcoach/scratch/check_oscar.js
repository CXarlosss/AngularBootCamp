const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOscar() {
  const oscarId = '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b';
  const { data, error } = await supabase
    .from('assigned_routines')
    .select('*')
    .eq('client_id', oscarId);

  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Oscar Assigned Routines:', data);
}

checkOscar();
