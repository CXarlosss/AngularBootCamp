const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bbarfrolxffbzakcfnzd.supabase.co';
const supabaseKey = 'sb_publishable_tJ2CeKi8RKsAQG8NACxT9Q_Xc-vG8Hu';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Final verification: activity_logs for Pedro...');
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select(`
      way_id, 
      action, 
      attempts, 
      metadata,
      created_at
    `)
    .eq('patient_id', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  // Format the output like the SQL query requested
  const formattedLogs = logs.map(log => ({
    way_id: log.way_id,
    action: log.action,
    attempts: log.attempts,
    is_homework: log.metadata?.isHomework,
    tiempo_ms: log.metadata?.timeSpentMs,
    created_at: log.created_at
  }));

  console.log('SQL Results (Pedro):');
  console.table(formattedLogs);
}

check();
