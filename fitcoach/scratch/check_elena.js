const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkElena() {
  const elenaId = 'f4796979-a7ad-49dd-80df-8bfe66423a9d';
  const { data, error } = await supabase
    .from('assigned_routines')
    .select('*')
    .eq('client_id', elenaId);

  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Elena Assigned Routines:', data);
}

checkElena();
