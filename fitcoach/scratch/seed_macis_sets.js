const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function seedMacisSets() {
  const { data: profile } = await supabase.from('profiles').select('id').ilike('full_name', '%Macis Test%').single();
  if (!profile) return console.log('Macis Test not found');
  
  const id = profile.id;
  
  // 1. Create a workout_log (though invisible to anon, it establishes the link)
  const { data: log, error: logErr } = await supabase.from('workout_logs').insert({
    client_id: id,
    logged_date: new Date().toISOString().split('T')[0],
    completed: true
  }).select().single();
  
  if (logErr) {
    console.error('Error seeding log (expected if RLS is tight):', logErr.message);
    // Even if it fails, we'll try to insert sets with a random UUID to see if the service handles it
  }

  const logId = log?.id || 'b74c7f54-f7f9-4e84-a999-5703e96c0974'; // Use an existing ID or the new one
  
  const today = new Date();
  const sets = [];
  
  // Seed 10 sets across 5 days
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    sets.push({
      workout_log_id: logId,
      exercise_id: 'e5e658f0-cfcc-4bd7-8b56-95839c446e90',
      exercise_name: 'Seed Exercise',
      set_number: 1,
      weight_kg: 10 + i,
      reps_done: 10,
      completed_at: d.toISOString()
    });
  }
  
  const { error: setErr } = await supabase.from('set_logs').insert(sets);
  if (setErr) {
    console.error('Error seeding sets:', setErr);
  } else {
    console.log('Sets seeded for Macis Test:', sets.length, 'entries');
  }
}

seedMacisSets();
