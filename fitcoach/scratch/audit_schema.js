const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function audit() {
  console.log('--- AUDIT REPORT ---');
  
  // 1. Check messages schema
  const { data: msgData, error: msgErr } = await supabase.from('messages').select('read_at').limit(1);
  if (msgErr) {
    console.log('Messages Table: MISSING read_at or Table Error', msgErr);
  } else {
    console.log('Messages Table: read_at column FOUND');
  }

  // 2. Check weight_logs count
  const { count, error: weightErr } = await supabase.from('weight_logs').select('*', { count: 'exact', head: true });
  if (weightErr) {
    console.log('Weight Logs: Table MISSING or Error', weightErr);
  } else {
    console.log(`Weight Logs: ${count} records found`);
  }

  // 3. Test Join: Workout Logs + Profiles
  const { data: joinData, error: joinErr } = await supabase
    .from('workout_logs')
    .select('id, logged_date, profiles(full_name)')
    .limit(1);
  
  if (joinErr) {
    console.log('Join Test (workout_logs -> profiles): FAILED', joinErr);
  } else {
    console.log('Join Test (workout_logs -> profiles): SUCCESS');
  }

  // 4. Test Join: Messages + Profiles
  const { data: msgJoinData, error: msgJoinErr } = await supabase
    .from('messages')
    .select('content, profiles!messages_sender_id_fkey(full_name)')
    .limit(1);

  if (msgJoinErr) {
    console.log('Join Test (messages -> profiles): FAILED', msgJoinErr);
  } else {
    console.log('Join Test (messages -> profiles): SUCCESS');
  }
}

audit();
