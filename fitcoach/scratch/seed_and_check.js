const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btfafaujqwldptlfpmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ'
);

async function checkMessagesSchema() {
  const { data, error } = await supabase.from('messages').select('*').limit(1);
  if (data && data[0]) {
    console.log('Columns for messages:', Object.keys(data[0]));
  } else if (error) {
    console.log('Error checking messages:', error.message);
  } else {
    console.log('Messages table is empty, trying to force error to see columns.');
    const { error: errCol } = await supabase.from('messages').select('non_existent');
    console.log('Error for columns:', errCol?.message);
  }
}

async function seedWeights() {
  const seeds = [
    // Oscar
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 89.5, recorded_at: new Date(Date.now() - 56 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 89.1, recorded_at: new Date(Date.now() - 49 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 88.4, recorded_at: new Date(Date.now() - 42 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 88.0, recorded_at: new Date(Date.now() - 35 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 87.2, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 87.5, recorded_at: new Date(Date.now() - 21 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 86.8, recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '5a5d88c9-27e6-4ba3-ae28-b0384c7d8f7b', weight_kg: 86.3, recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), notes: 'seed_data' },
    // Macis
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 83.0, recorded_at: new Date(Date.now() - 56 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 82.8, recorded_at: new Date(Date.now() - 49 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 82.5, recorded_at: new Date(Date.now() - 42 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 82.9, recorded_at: new Date(Date.now() - 35 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 82.2, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 81.8, recorded_at: new Date(Date.now() - 21 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 82.0, recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: '4c803c7a-30dc-4b42-bb81-af562682e86f', weight_kg: 81.5, recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), notes: 'seed_data' },
    // Elena
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 64.0, recorded_at: new Date(Date.now() - 56 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 63.6, recorded_at: new Date(Date.now() - 49 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 63.8, recorded_at: new Date(Date.now() - 42 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 63.2, recorded_at: new Date(Date.now() - 35 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 63.0, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 62.7, recorded_at: new Date(Date.now() - 21 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 62.5, recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'seed_data' },
    { client_id: 'f4796979-a7ad-49dd-80df-8bfe66423a9d', weight_kg: 62.2, recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), notes: 'seed_data' }
  ];

  console.log('Cleaning up old seed data...');
  await supabase.from('weight_logs').delete().eq('notes', 'seed_data');
  
  console.log('Inserting seed data...');
  const { error } = await supabase.from('weight_logs').insert(seeds);
  if (error) console.error('Error seeding weights:', error.message);
  else console.log('Successfully seeded weights.');
}

async function run() {
  await checkMessagesSchema();
  await seedWeights();
}

run();
