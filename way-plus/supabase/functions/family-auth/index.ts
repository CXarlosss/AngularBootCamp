import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const { token } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('family_access')
    .select('patient_id, access_enabled')
    .eq('access_token', token)
    .single();

  if (error || !data || !data.access_enabled) {
    return new Response(JSON.stringify({ valid: false }), { status: 401 });
  }

  // Actualizar last_accessed_at
  await supabase
    .from('family_access')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('access_token', token);

  return new Response(
    JSON.stringify({ valid: true, patient_id: data.patient_id }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
