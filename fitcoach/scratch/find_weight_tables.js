const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function findWeightTables() {
  const candidates = ['weight_logs', 'weight_history', 'weights', 'client_weights', 'user_weights', 'body_weights'];
  for (const c of candidates) {
    const { error } = await supabase.from(c).select('count', { count: 'exact', head: true });
    if (!error) {
      console.log(`FOUND_TABLE: ${c}`);
      return;
    } else {
      console.log(`Checking ${c}: ${error.code} - ${error.message}`);
    }
  }
}

findWeightTables();
