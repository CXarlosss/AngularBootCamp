import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webPush from "npm:web-push@3.6.7";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BKqtpVO0-WKMpbMWmrNmoZ62z1I4-7u9mVMaRA7YBMxSsv2qiwvWJHY26lrv8qAUEVQlz3Gf2cLCJwIJ9afOH4w';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'Ya5u0uJqHCiJ5KRZFXMOXbFzEY-Rc5P4k92TcEv6NcU';

webPush.setVapidDetails(
  'mailto:support@wayplus.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { user_id, title, body, url } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Falta user_id' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id);

    if (error) throw error;

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay suscripciones para este usuario' }), { status: 200 });
    }

    const payload = JSON.stringify({
      title: title || 'WAY+ Notificación',
      body: body || 'Nueva actividad en WAY+',
      url: url || '/'
    });

    const results = await Promise.all(
      subs.map(async (row) => {
        try {
          await webPush.sendNotification(row.subscription, payload);
          return { success: true };
        } catch (err) {
          console.error('Error enviando push:', err);
          return { success: false, error: err };
        }
      })
    );

    return new Response(JSON.stringify({ message: 'Push enviadas', results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
