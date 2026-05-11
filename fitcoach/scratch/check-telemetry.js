const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btfafaujqwldptlfpmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmFmYXVqcXdsZHB0bGZwbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzA0NDcsImV4cCI6MjA5MTcwNjQ0N30.EZLtSMPNLVwBFip0xA2_ZVcmxMVd3_SJupAsbdPTrOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Telemetry Results (Morning) ---');
  
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event_name, properties, timestamp')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  const stats = events.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {});

  console.log('Event Counts:', stats);

  const setSaved = events.filter(e => e.event_name === 'set_saved');
  const undoTriggered = events.filter(e => e.event_name === 'undo_triggered');

  console.log(`Efficiency (Undos vs Saved): ${undoTriggered.length} undos / ${setSaved.length} sets saved`);
  
  if (setSaved.length > 0) {
    const errorRate = (undoTriggered.length / setSaved.length) * 100;
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
  }

  // Check last 10 events
  console.log('Last 10 events:', JSON.stringify(events.slice(0, 10), null, 2));
}

check();
