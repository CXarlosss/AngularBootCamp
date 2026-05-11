// supabase/functions/weekly-missions-cron/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Obtener todos los clientes activos
  const { data: clients } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'client');
  
  if (!clients) return new Response('No clients', { status: 200 });
  
  // Obtener templates
  const { data: templates } = await supabase
    .from('mission_templates')
    .select('*')
    .eq('is_active', true);
  
  if (!templates) return new Response('No templates', { status: 200 });
  
  const weekStart = getWeekStart();
  const inserts: any[] = [];
  
  for (const client of clients) {
    // Verificar si ya tiene misiones esta semana
    const { data: existing } = await supabase
      .from('client_missions')
      .select('id')
      .eq('client_id', client.id)
      .eq('week_start', weekStart)
      .limit(1);
    
    if (existing && existing.length > 0) continue;
    
    // Seleccionar 3 misiones (1 fácil, 1 media, 1 difícil)
    const byDifficulty: Record<number, any[]> = {
      1: templates.filter(t => t.difficulty === 1),
      2: templates.filter(t => t.difficulty === 2),
      3: templates.filter(t => t.difficulty === 3)
    };
    
    const selected = [
      randomPick(byDifficulty[1]),
      randomPick(byDifficulty[2]),
      randomPick(byDifficulty[3])
    ].filter((t): t is any => t !== null);
    
    for (const template of selected) {
      inserts.push({
        client_id: client.id,
        mission_template_id: template.id,
        week_start: weekStart,
        target_value: template.target_value,
        xp_reward: template.xp_reward
      });
    }
  }
  
  if (inserts.length > 0) {
    const { error } = await supabase.from('client_missions').insert(inserts);
    if (error) console.error('Insert error:', error);
  }
  
  return new Response(`Generated missions for ${inserts.length} clients`, { status: 200 });
});

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function randomPick<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
