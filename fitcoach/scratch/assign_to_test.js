const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function assignToTest() {
  const testId = '39756ada-3024-4b3f-988a-53771d9111ee';
  const routineId = '381620bc-1ffa-41d2-b717-e336f6a54cef';

  const { error } = await supabase.from('assigned_routines').insert({
    client_id: testId,
    routine_id: routineId,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0]
  });

  if (error) console.error('Error:', error);
  else console.log('Assigned to test client!');
}

assignToTest();
