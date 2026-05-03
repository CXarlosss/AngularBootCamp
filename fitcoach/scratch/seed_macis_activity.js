const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function seedMacisActivity() {
  const { data: profile } = await supabase.from('profiles').select('id').ilike('full_name', '%Macis Test%').single();
  if (!profile) return console.log('Macis Test not found');
  
  const id = profile.id;
  const today = new Date();
  const activity = [];
  
  // Seed 15 days of activity in the last 20 days
  for (let i = 0; i < 20; i++) {
    if (Math.random() > 0.3) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      activity.push({
        user_id: id,
        completed_at: d.toISOString(),
      });
    }
  }
  
  const { error } = await supabase.from('completed_days').insert(activity);
  if (error) {
    console.error('Error seeding activity:', error);
  } else {
    console.log('Activity seeded for Macis Test:', activity.length, 'days');
  }
}

seedMacisActivity();
