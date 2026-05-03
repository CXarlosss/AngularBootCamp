const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkCreatedAt() {
  const { data, error } = await supabase.from('set_logs').select('*').limit(1);
  if (data && data.length > 0) {
    // Check if created_at exists in keys
    console.log('Keys in set_logs:', Object.keys(data[0]));
    console.log('First row created_at:', data[0].created_at);
  }
}

checkCreatedAt();
