import { patientService } from '../services/patientService';
import { supabase } from '../services/supabaseClient';

/**
 * Utilidad para sembrar datos de prueba para Maite.
 * Inserta a Lucía y Pedro con progreso real.
 */
export async function seedClinicalData() {
  if (!supabase) return { success: false, message: 'Supabase no configurado' };

  console.log('[Seed] Iniciando siembra de datos clínicos...');

  // 1. Crear a Lucía
  const lucia = await patientService.create({
    name: 'Lucía',
    age: 7,
    avatar: 'base-kitten'
  });

  // 2. Crear a Pedro
  const pedro = await patientService.create({
    name: 'Pedro',
    age: 9,
    avatar: 'base-dragon'
  });

  if (!pedro) return { success: false, message: 'Error al crear a Pedro' };

  // 3. Simular progreso para Pedro (8 retos completados)
  const ways = [
    'way-breathing-1', 'way-breathing-2', 
    'way-focus-1', 'way-focus-2',
    'way-emotion-1', 'way-emotion-2',
    'way-social-1', 'way-social-2'
  ];

  // Actualizar perfil de Pedro con monedas e inventario
  await supabase
    .from('patient_profiles')
    .update({ 
      coins: 450,
      completed_ways: ways,
      inventory: ['sticker-star', 'item-potion-blue']
    })
    .eq('id', pedro.id);

  // 4. Insertar logs de actividad para la telemetría del dashboard
  const logs = ways.map(wayId => ({
    patient_id: pedro.id,
    way_id: wayId,
    action: 'way_completed',
    metadata: { isHomework: false, timeSpentMs: 120000 + Math.random() * 60000 }
  }));

  await supabase.from('activity_logs').insert(logs);

  console.log('[Seed] ¡Siembra completada con éxito!');
  return { success: true, luciaId: lucia?.id, pedroId: pedro.id };
}
