const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding mission_templates...');
  const templates = [
    { type: 'frequency', title: 'Constancia de Hierro', description: 'Completa 3 entrenamientos esta semana', target_value: 3, xp_reward: 50, icon: '🔥', difficulty: 1 },
    { type: 'volume', title: 'Centurión de Series', description: 'Registra 50 series en total esta semana', target_value: 50, xp_reward: 75, icon: '⚔️', difficulty: 2 },
    { type: 'quality', title: 'Precisión Perfecta', description: 'Mantén 90% de adherencia al peso objetivo', target_value: 90, xp_reward: 100, icon: '🎯', difficulty: 2 },
    { type: 'social', title: 'Feedback al Coach', description: 'Envía un mensaje a tu coach esta semana', target_value: 1, xp_reward: 25, icon: '💬', difficulty: 1 },
    { type: 'frequency', title: 'Guerrero de la Semana', description: 'Entrena 5 días esta semana', target_value: 5, xp_reward: 150, icon: '🛡️', difficulty: 3 },
    { type: 'volume', title: 'Titán del Volumen', description: 'Acumula 100 series esta semana', target_value: 100, xp_reward: 200, icon: '🏛️', difficulty: 3 }
  ];

  const { error: tError } = await supabase.from('mission_templates').insert(templates);
  if (tError) console.error('Error seeding templates:', tError);
  else console.log('Templates seeded successfully.');

  console.log('Updating feature flag...');
  // Intentamos update primero, si falla (no existe fila), insertamos.
  const { error: fError } = await supabase.from('feature_flags').update({ rollout_percentage: 25, enabled: true }).eq('name', 'gamification_v2');
  if (fError) {
    console.log('Feature flag not found, creating it...');
    await supabase.from('feature_flags').insert({ name: 'gamification_v2', enabled: true, rollout_percentage: 25, description: 'Gamificación v2' });
  } else {
    console.log('Feature flag updated.');
  }
}

seed();
