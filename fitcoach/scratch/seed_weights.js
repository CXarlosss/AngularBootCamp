const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function seed() {
  const oscarId = '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b';
  const elenaId = 'f4796979-a7ad-49dd-80df-8bfe66423a9d';

  const logs = [
    // Oscar - Baja peso
    { client_id: oscarId, weight_kg: 89.5, recorded_at: new Date(Date.now() - 56 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 89.1, recorded_at: new Date(Date.now() - 49 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 88.7, recorded_at: new Date(Date.now() - 42 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 88.2, recorded_at: new Date(Date.now() - 35 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 87.8, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 87.5, recorded_at: new Date(Date.now() - 21 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 87.0, recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 86.8, recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), notes: 'seed' },
    { client_id: oscarId, weight_kg: 86.5, recorded_at: new Date().toISOString(), notes: 'seed' },

    // Elena - Mantenimiento
    { client_id: elenaId, weight_kg: 62.0, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString(), notes: 'seed' },
    { client_id: elenaId, weight_kg: 61.8, recorded_at: new Date(Date.now() - 21 * 86400000).toISOString(), notes: 'seed' },
    { client_id: elenaId, weight_kg: 62.1, recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'seed' },
    { client_id: elenaId, weight_kg: 61.9, recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), notes: 'seed' },
    { client_id: elenaId, weight_kg: 62.0, recorded_at: new Date().toISOString(), notes: 'seed' },
  ];

  const { error } = await supabase.from('weight_logs').insert(logs);
  if (error) {
    console.error('Error seeding:', error);
  } else {
    console.log('Seeding SUCCESSFUL');
  }
}

seed();
