const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';
const elenaId = 'f4796979-a7ad-49dd-80df-8bfe66423a9d';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('--- TEST A: GENERAR MISIONES ---');
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0,0,0,0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // 1. Limpiar misiones previas de Elena para esta semana
  await supabase.from('client_missions').delete().eq('client_id', elenaId).eq('week_start', weekStartStr);

  // 2. Obtener templates
  const { data: templates } = await supabase.from('mission_templates').select('*').eq('is_active', true);
  if (!templates || templates.length === 0) {
    console.log('No mission templates found. Did you run the migration?');
    return;
  }

  // 3. Insertar 3 misiones
  const selected = templates.slice(0, 3);
  const inserts = selected.map(t => ({
    client_id: elenaId,
    mission_template_id: t.id,
    week_start: weekStartStr,
    target_value: t.target_value,
    xp_reward: t.xp_reward
  }));

  const { error: insertError } = await supabase.from('client_missions').insert(inserts);
  if (insertError) {
    console.error('Error inserting missions:', insertError);
  } else {
    console.log('Misiones generadas para Elena.');
  }

  // 4. Verificar
  const { data: activeMissions } = await supabase
    .from('client_missions')
    .select('id, mission_template_id, target_value, current_value')
    .eq('client_id', elenaId)
    .eq('week_start', weekStartStr);
  console.table(activeMissions);

  console.log('\n--- TEST B: SIMULAR ENTRENAMIENTO ---');
  // Simular un workout_log
  const { data: workout, error: workoutError } = await supabase
    .from('workout_logs')
    .insert({
      client_id: elenaId,
      routine_id: 'test-routine',
      day_number: 1,
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (workoutError) {
    console.error('Error inserting workout:', workoutError);
  } else {
    console.log('Workout log creado:', workout.id);
    
    // Actualizar progreso (frecuencia +1, volumen +3)
    // Buscamos la misión de frecuencia
    const freqMission = activeMissions.find(m => templates.find(t => t.id === m.mission_template_id && t.type === 'frequency'));
    if (freqMission) {
      await supabase.from('client_missions').update({ current_value: 1 }).eq('id', freqMission.id);
      console.log('Misión de frecuencia actualizada.');
    }
    
    const volMission = activeMissions.find(m => templates.find(t => t.id === m.mission_template_id && t.type === 'volume'));
    if (volMission) {
      await supabase.from('client_missions').update({ current_value: 3 }).eq('id', volMission.id);
      console.log('Misión de volumen actualizada.');
    }
  }

  console.log('\n--- TEST C: RECLAMAR XP ---');
  // Forzar completada
  const firstMission = activeMissions[0];
  await supabase.from('client_missions').update({ is_completed: true, is_claimed: true }).eq('id', firstMission.id);
  
  // Usar RPC add_xp si existe
  const { error: xpError } = await supabase.rpc('add_xp', {
    p_client_id: elenaId,
    p_total_xp: 50
  });

  if (xpError) {
    console.error('Error calling add_xp RPC:', xpError);
    // Fallback: update manual si RPC falla
    await supabase.from('athlete_ranks').update({ xp_total: 50 }).eq('client_id', elenaId);
  } else {
    console.log('XP reclamado vía RPC.');
  }

  const { data: rank } = await supabase.from('athlete_ranks').select('xp_total').eq('client_id', elenaId).single();
  console.log('Elena XP Total:', rank?.xp_total);

  console.log('\n--- TEST D: RACHA SEMANAL ---');
  await supabase.from('weekly_streaks').upsert({
    client_id: elenaId,
    week_start: weekStartStr,
    days_completed: 1,
    target_days: 3
  }, { onConflict: 'client_id, week_start' });
  
  const { data: streak } = await supabase.from('weekly_streaks').select('*').eq('client_id', elenaId).eq('week_start', weekStartStr).single();
  console.log('Estado de racha:', streak.days_completed, '/', streak.target_days);
}

runTests();
