const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bbarfrolxffbzakcfnzd.supabase.co';
const supabaseKey = 'sb_publishable_tJ2CeKi8RKsAQG8NACxT9Q_Xc-vG8Hu';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, role').limit(5);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles found:', profiles);
  }
}

check();
