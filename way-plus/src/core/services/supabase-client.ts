/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Supabase Client — Conexión al backend real
 * ═══════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper para suscripciones realtime
export const subscribeToPatientProgress = (
  patientId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`patient-progress-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_levels',
        filter: `patient_id=eq.${patientId}`,
      },
      callback
    )
    .subscribe();
};
