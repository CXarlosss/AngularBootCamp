/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Mock Supabase — Modo desarrollo sin credenciales reales
 * Intercepta llamadas y devuelve datos de prueba. Consola limpia.
 * ═══════════════════════════════════════════════════════════════
 */

import { supabase } from './supabase-client';

const MOCK_ENABLED = import.meta.env.VITE_MOCK_SUPABASE === 'true' || !import.meta.env.VITE_SUPABASE_URL;

const MOCK_PATIENTS = [
  { id: 'mock-p1', display_name: 'Lucía', age: 7, character_id: 'luna', status: 'active', current_streak: 5, total_stars: 47, therapist_id: 'mock-therapist' },
  { id: 'mock-p2', display_name: 'Tomás', age: 9, character_id: 'nube', status: 'active', current_streak: 2, total_stars: 23, therapist_id: 'mock-therapist' },
];

const MOCK_LEVELS = [
  { id: 'mock-l1', title: 'El Bosque Encantado', difficulty: 3, category: 'atencion', order_index: 0, is_template: false, therapist_id: 'mock-therapist' },
  { id: 'mock-l2', title: 'Respiración del Globo', difficulty: 2, category: 'regulacion', order_index: 1, is_template: false, therapist_id: 'mock-therapist' },
];

export function enableMockMode() {
  if (!MOCK_ENABLED) return;

  console.log('🧪 WAY+ Mock Mode activado. Sin llamadas reales a Supabase.');

  // Interceptar select
  const originalFrom = supabase.from.bind(supabase);
  supabase.from = (table: string) => {
    const mockTable = originalFrom(table);

    // Sobrescribir métodos clave
    mockTable.select = () => ({
      eq: () => ({
        single: async () => ({ data: MOCK_PATIENTS[0], error: null }),
        order: () => ({
          data: table === 'patients' ? MOCK_PATIENTS : table === 'levels' ? MOCK_LEVELS : [],
          error: null,
        }),
      }),
      order: () => ({
        data: table === 'patients' ? MOCK_PATIENTS : table === 'levels' ? MOCK_LEVELS : [],
        error: null,
      }),
    }) as any;

    mockTable.insert = async () => ({ data: { id: 'mock-new' }, error: null }) as any;
    mockTable.upsert = async () => ({ data: { id: 'mock-new' }, error: null }) as any;
    mockTable.delete = async () => ({ error: null }) as any;

    return mockTable;
  };

  // Auth mock
  (supabase.auth as any).getSession = async () => ({
    data: {
      session: {
        user: { id: 'mock-therapist', email: 'dev@wayplus.test' },
      },
    },
  });
  (supabase.auth as any).getUser = async () => ({
    data: { user: { id: 'mock-therapist', email: 'dev@wayplus.test' } },
  });
  (supabase.auth as any).signInWithOAuth = async () => ({ error: null });
  (supabase.auth as any).signOut = async () => ({ error: null });
}
