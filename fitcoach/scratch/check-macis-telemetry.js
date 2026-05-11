const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const MACIS_ID = '4c803c7a-30dc-4b42-bb81-af562682e86f';

async function checkMacisTelemetry() {
  console.log(`--- Checking Telemetry for Macis (${MACIS_ID}) ---`);
  
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_name, properties, timestamp')
    .eq('user_id', MACIS_ID)
    .gt('timestamp', tenMinutesAgo)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('0 filas devueltas. No hay eventos recientes para Macis.');
    
    // Check if there are ANY events for Macis at all
    const { count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', MACIS_ID);
    
    console.log(`Total histórico de eventos para Macis: ${count || 0}`);
    return;
  }

  console.log(`Se encontraron ${data.length} eventos recientes:`);
  console.table(data.map(e => ({
    event: e.event_name,
    input_method: e.properties?.input_method || 'n/a',
    time: e.timestamp
  })));
}

checkMacisTelemetry();
