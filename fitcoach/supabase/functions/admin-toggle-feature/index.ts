import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Token estático configurado en secrets de Supabase
const ADMIN_TOKEN = Deno.env.get('ADMIN_TOGGLE_TOKEN'); // Ej: 'fitcoach-sprint5-xyz'

Deno.serve(async (req) => {
  // 1. VALIDACIÓN DE MÉTODO Y AUTH
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== \`Bearer \${ADMIN_TOKEN}\`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 2. PARSE DEL BODY
  let body: { flag_name: string; target_percentage: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { flag_name, target_percentage } = body;

  if (!flag_name || target_percentage === undefined || target_percentage < 0 || target_percentage > 100) {
    return new Response(JSON.stringify({ error: 'Missing or invalid parameters' }), { status: 400 });
  }

  // 3. CLIENTE SUPABASE CON SERVICE ROLE
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  // 4. FETCH ESTADO ACTUAL (para audit trail)
  const { data: current, error: fetchError } = await supabase
    .from('feature_flags')
    .select('rollout_percentage, hash_seed, flag_name')
    .eq('flag_name', flag_name)
    .single();

  if (fetchError || !current) {
    return new Response(JSON.stringify({ error: 'Flag not found', details: fetchError }), { status: 404 });
  }

  // 5. ATOMIC UPDATE CON AUDIT TRAIL
  const { error: updateError } = await supabase
    .from('feature_flags')
    .update({
      rollout_percentage: target_percentage,
      previous_percentage: current.rollout_percentage,
      updated_by: 'admin-toggle-feature',
      updated_at: new Date().toISOString()
    })
    .eq('flag_name', flag_name);

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Update failed', details: updateError }), { status: 500 });
  }

  // 6. BROADCAST REALTIME PARA INVALIDAR CACHÉ FRONTEND
  // Los clientes online reciben esto y refrescan su caché de feature flags
  const channel = supabase.channel('feature_flags_global');
  await channel.send({
    type: 'broadcast',
    event: 'flag_updated',
    payload: {
      flag_name,
      new_percentage: target_percentage,
      previous_percentage: current.rollout_percentage,
      changed_at: new Date().toISOString()
    }
  });

  // 7. RESPUESTA
  return new Response(JSON.stringify({
    success: true,
    flag: flag_name,
    previous_percentage: current.rollout_percentage,
    current_percentage: target_percentage,
    hash_seed: current.hash_seed // Importante: el frontend recalcula su elegibilidad
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
