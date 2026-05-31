import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initializeApp, cert, getApps } from 'https://esm.sh/firebase-admin@12.0.0/app';
import { getMessaging } from 'https://esm.sh/firebase-admin@12.0.0/messaging';

// EXCLUSIÓN ELENA: UUID hardcodeado, nunca se le envía notificación
const EXCLUDED_USERS = ['f4796979-a7ad-49dd-80df-8bfe66423a9d'];

// Inicializar Firebase Admin una sola vez
const firebaseApp = getApps().length === 0 
  ? initializeApp({
      credential: cert({
        projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
        privateKey: Deno.env.get('FIREBASE_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
        clientEmail: Deno.env.get('FIREBASE_CLIENT_EMAIL'),
      }),
    })
  : getApps()[0];

const messaging = getMessaging(firebaseApp);

Deno.serve(async (req) => {
  // 1. AUTH: Solo service_role o webhook interno
  const authHeader = req.headers.get('Authorization');
  const internalToken = Deno.env.get('INTERNAL_WEBHOOK_TOKEN');
  
  if (authHeader !== `Bearer ${internalToken}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 2. PARSE PAYLOAD
  let payload: {
    user_id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    priority?: 'high' | 'normal';
  };

  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { user_id, title, body, data = {}, priority = 'normal' } = payload;

  if (!user_id || !title || !body) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // 3. EXCLUSIÓN ELENA (doble blindaje: aquí y en el RPC)
  if (EXCLUDED_USERS.includes(user_id)) {
    return new Response(JSON.stringify({ 
      success: false, 
      reason: 'User excluded from push notifications' 
    }), { status: 403 });
  }

  // 4. SUPABASE CLIENT (service_role)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  // 5. RESOLVER TOKENS ACTIVOS (RPC ya blinda Elena, pero doble seguridad)
  const { data: tokens, error: tokenError } = await supabase
    .rpc('get_active_fcm_tokens', { target_user_id: user_id });

  if (tokenError || !tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ 
      error: 'No active tokens found',
      details: tokenError 
    }), { status: 404 });
  }

  // 6. ENVIAR NOTIFICACIONES
  const results = await Promise.allSettled(
    tokens.map(async (t: { token: string; device_type: string }) => {
      try {
        await messaging.send({
          token: t.token,
          notification: { title, body },
          data: {
            ...data,
            deepLink: data.deepLink || '/client/dashboard',
            sent_at: new Date().toISOString(),
          },
          android: {
            priority: priority as any,
            notification: {
              channelId: 'fitcoach_default',
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        });
        return { token: t.token, status: 'sent' };
      } catch (err: any) {
        // 7. INVALIDACIÓN AUTOMÁTICA DE TOKENS MUERTOS
        if (err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token') {
          await supabase.rpc('deactivate_fcm_token', { target_token: t.token });
          return { token: t.token, status: 'invalidated', reason: err.code };
        }
        return { token: t.token, status: 'failed', reason: err.message };
      }
    })
  );

  // 8. RESPUESTA
  const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'sent').length;
  const invalidated = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'invalidated').length;
  const failed = results.filter(r => r.status === 'rejected' || (r.value as any).status === 'failed').length;

  return new Response(JSON.stringify({
    success: true,
    user_id,
    sent,
    invalidated,
    failed,
    total_tokens: tokens.length,
  }), { status: 200 });
});
