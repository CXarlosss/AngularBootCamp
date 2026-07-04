import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { ALL_STEPS } from '../src/content/registry';

// Load env vars
dotenv.config();
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl.replace(/\/rest\/v1\/?$/, ''), supabaseKey);

async function runSeed() {
  console.log('🚀 Iniciando seed de contenido clínico real a Supabase...');
  console.log(`📡 URL: ${supabaseUrl}\n`);
  
  const steps = Object.values(ALL_STEPS);
  let totalWays = 0;
  
  console.log('📤 Subiendo STEPS a Supabase...');
  let stepsInserted = 0, stepsFailed = 0;
  
  for (const step of steps) {
    const { error } = await supabase.from('steps').upsert({
      id: step.id,
      level_id: step.levelId,
      title: step.title,
      subtitle: step.subtitle,
      theme: step.theme,
      order_index: step.stepNumber,
      is_published: true
    });
    
    if (error) {
      console.error(`   ❌ Error subiendo step ${step.id}:`, error.message);
      stepsFailed++;
    } else {
      stepsInserted++;
      if (step.ways) totalWays += step.ways.length;
    }
  }
  
  console.log(`   ✅ Steps procesados: ${stepsInserted}`);
  if (stepsFailed > 0) console.log(`   ❌ Steps fallidos: ${stepsFailed}`);
  
  console.log('\n📤 Subiendo WAYS a Supabase...');
  let waysInserted = 0, waysFailed = 0;
  
  for (const step of steps) {
    if (!step.ways) continue;
    for (const way of step.ways) {
      const { error } = await supabase.from('ways').upsert({
        id: way.id,
        step_id: step.id,
        type: way.type,
        name: way.name,
        title: way.title,
        order_index: way.order ?? way.wayNumber,
        stimulus: way.stimulus,
        options: way.options,
        source: way.source,
        metadata: way.metadata,
        is_published: true,
      });
      
      if (error) {
        console.error(`   ❌ Error subiendo way ${way.id}:`, error.message);
        waysFailed++;
      } else {
        waysInserted++;
      }
    }
  }
  
  console.log(`   ✅ Ways procesados: ${waysInserted}`);
  if (waysFailed > 0) console.log(`   ❌ Ways fallidos: ${waysFailed}`);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN DEL SEED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Steps: ${stepsInserted} procesados, ${stepsFailed} fallidos`);
  console.log(`Ways:  ${waysInserted} procesados, ${waysFailed} fallidos`);
  console.log('\n🎉 ¡Seed completado exitosamente!');
}

runSeed().catch(err => {
  console.error('Error catastrófico:', err);
  process.exit(1);
});
