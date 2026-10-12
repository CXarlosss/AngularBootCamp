/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ usePatientProgress — TanStack Query + Supabase Realtime
 * El terapeuta ve el progreso del niño EN VIVO mientras juega
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, subscribeToPatientProgress } from '@/core/services/supabase-client';

export interface PatientProgress {
  levelId: string;
  levelTitle: string;
  status: string;
  score: number;
  completedAt: string | null;
}

export function usePatientProgress(patientId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['patient-progress', patientId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('patient_levels')
        .select(`
          level_id,
          status,
          score,
          completed_at,
          levels:level_id(title)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PatientProgress[];
    },
    enabled: !!patientId,
  });

  // ─── REALTIME: Actualizar caché cuando el niño progresa ───
  useEffect(() => {
    if (!patientId) return;

    const subscription = subscribeToPatientProgress(patientId, (payload) => {
      // Invalidar y refetch automático
      queryClient.invalidateQueries({ queryKey });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [patientId, queryClient, queryKey]);

  return { progress: data || [], isLoading, error };
}
