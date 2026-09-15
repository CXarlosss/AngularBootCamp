import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function bumpXP() {
  console.log('Actualizando XP de TODOS los usuarios...');
  const { data, error } = await supabase
    .from('athlete_ranks')
    .update({ xp_total: 65000, progress_xp: 35000, rank_level: 5 })
    .neq('client_id', '00000000-0000-0000-0000-000000000000'); // hack to update all
    
  if (error) {
    console.error('Error actualizando XP:', error);
  } else {
    console.log('¡Éxito! XP actualizada.');
  }
}

bumpXP();
