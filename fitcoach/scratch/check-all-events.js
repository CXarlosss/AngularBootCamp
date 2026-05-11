const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllEvents() {
  console.log('--- Checking ALL Telemetry Events ---');
  
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event_name, timestamp');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('0 filas devueltas. No hay eventos en la tabla analytics_events.');
    return;
  }

  const stats = events.reduce((acc, event) => {
    if (!acc[event.event_name]) {
      acc[event.event_name] = {
        total: 0,
        primero: event.timestamp,
        ultimo: event.timestamp
      };
    }
    acc[event.event_name].total++;
    if (event.timestamp < acc[event.event_name].primero) acc[event.event_name].primero = event.timestamp;
    if (event.timestamp > acc[event.event_name].ultimo) acc[event.event_name].ultimo = event.timestamp;
    return acc;
  }, {});

  console.table(Object.keys(stats).map(name => ({
    event_name: name,
    total: stats[name].total,
    primero: stats[name].primero,
    ultimo: stats[name].ultimo
  })).sort((a, b) => b.total - a.total));
}

checkAllEvents();
