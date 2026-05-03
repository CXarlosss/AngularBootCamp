const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function seedMacisLogsSimple() {
  const { data: profile } = await supabase.from('profiles').select('id').ilike('full_name', '%Macis Test%').single();
  if (!profile) return console.log('Macis Test not found');
  
  const id = profile.id;
  const today = new Date();
  const logs = [];
  
  for (let i = 0; i < 20; i++) {
    if (Math.random() > 0.3) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      logs.push({
        client_id: id,
        logged_date: d.toISOString().split('T')[0],
        completed: true
      });
    }
  }
  
  const { error } = await supabase.from('workout_logs').insert(logs);
  if (error) {
    console.error('Error seeding logs:', error);
  } else {
    console.log('Logs seeded for Macis Test:', logs.length, 'entries');
  }
}

seedMacisLogsSimple();
