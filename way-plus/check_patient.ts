import { supabase } from './src/core/services/supabaseClient';

async function checkPatient() {
  const { data, error } = await supabase
    .from('patient_profiles')
    .select('completed_ways, coins')
    .eq('id', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Patient Profile Data:', data);
  }
}

checkPatient();
