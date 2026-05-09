const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking last 5 workout logs...');
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, client_id, logged_date, completed')
    .order('logged_date', { ascending: false })
    .limit(5);

  console.log('Recent Logs:', JSON.stringify(logs, null, 2));

  const elenaId = 'f4796979-a7ad-49dd-80df-8bfe66423a9d';
  const { data: elenaRank } = await supabase
    .from('athlete_ranks')
    .select('*')
    .eq('client_id', elenaId)
    .maybeSingle();
  
  console.log('Elena Rank:', JSON.stringify(elenaRank, null, 2));
}

check();
