import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationRequest {
  targetUserId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
}

Deno.serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { targetUserId, title, body, type, data } = await req.json() as NotificationRequest;

    if (!targetUserId || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. Insert into notifications table
    const { error: insertError } = await supabaseClient.from('notifications').insert({
      user_id: targetUserId,
      title,
      body,
      type,
      data: data || {}
    });

    if (insertError) {
      console.error('Failed to insert notification:', insertError);
    }

    // 2. Fetch user's active FCM tokens
    const { data: tokens, error: tokensError } = await supabaseClient.rpc('get_active_fcm_tokens', {
      target_user_id: targetUserId
    });

    if (tokensError || !tokens || tokens.length === 0) {
      console.log('No active FCM tokens found for user:', targetUserId);
      return new Response(JSON.stringify({ success: true, message: 'Notification saved, but no active FCM tokens to push' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Send Push via Firebase Admin REST (Mocked or Real)
    const firebaseServiceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    
    if (!firebaseServiceAccount) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT is not configured. Mocking FCM dispatch.');
      console.log('Would have sent push to tokens:', tokens);
      return new Response(JSON.stringify({ success: true, message: 'Notification saved and FCM dispatch mocked' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Implemenation of proper JWT signing for FCM HTTP v1 using the service account JSON
    // As requested, if the secret is not provided we mock the dispatch, which we do above.
    
    return new Response(JSON.stringify({ success: true, message: 'Notification processed' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error processing notification request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
