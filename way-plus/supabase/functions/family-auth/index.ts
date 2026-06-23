import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@1.1.0';
import { Redis } from 'https://esm.sh/@upstash/redis@1.28.0';

// Intentar inicializar Redis si las variables de entorno existen
let ratelimit: Ratelimit | null = null;
const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

if (redisUrl && redisToken) {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 intentos por minuto
    analytics: true,
  });
}

Deno.serve(async (req) => {
  // Rate limiting si está configurado
  if (ratelimit) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const { token } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('family_access')
    .select('patient_id, access_enabled, expires_at')
    .eq('access_token', token)
    .single();

  if (error || !data || !data.access_enabled) {
    return new Response(JSON.stringify({ valid: false }), { status: 401 });
  }

  // Verificar si el token expiró (si tiene expires_at configurado)
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return new Response(JSON.stringify({ valid: false, error: 'Token expired' }), { status: 401 });
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
