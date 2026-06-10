import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ActivityLogData {
  patient_id: string;
  way_id: string;
  action: string;
  attempts?: number;
  metadata?: Record<string, any>;
}

interface LogRequest {
  patient_id: string;
  pin: string;
  logs: ActivityLogData[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { patient_id, pin, logs } = await req.json() as LogRequest;

    if (!patient_id || !pin || !logs || !Array.isArray(logs)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Initialize Supabase client with Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. Verify Patient PIN
    const { data: patient, error: patientError } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('id', patient_id)
      .eq('pin', pin)
      .single();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid PIN or Patient ID' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Insert Logs
    // Ensure all logs have the authenticated patient_id to prevent injection
    const validLogs = logs.map(l => ({
      ...l,
      patient_id: patient_id
    }));

    const { error: insertError } = await supabase.from('activity_logs').insert(validLogs);

    if (insertError) {
      console.error('Failed to insert activity logs:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to insert logs' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true, count: validLogs.length }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error processing log activity request:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
