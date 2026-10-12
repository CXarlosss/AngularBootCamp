/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useTherapistPatients — Lista de pacientes con métricas
 * ═══════════════════════════════════════════════════════════════
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/services/supabase-client';

export interface PatientSummary {
  id: string;
  displayName: string;
  characterId: string;
  age: number;
  status: string;
  currentStreak: number;
  totalStars: number;
  lastSessionAt: string | null;
  adherenceScore: number;
}

export function useTherapistPatients(therapistId: string | null) {
  return useQuery({
    queryKey: ['therapist-patients', therapistId],
    queryFn: async () => {
      if (!therapistId) return [];
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          display_name,
          character_id,
          age,
          status,
          current_streak,
          total_stars,
          sessions(started_at)
        `)
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        displayName: p.display_name,
        characterId: p.character_id,
        age: p.age,
        status: p.status,
        currentStreak: p.current_streak,
        totalStars: p.total_stars,
        lastSessionAt: p.sessions?.[0]?.started_at || null,
        adherenceScore: calculateAdherence(p),
      })) as PatientSummary[];
    },
    enabled: !!therapistId,
  });
}

function calculateAdherence(patient: any): number {
  // Lógica simple: basado en racha y sesiones recientes
  const streak = patient.current_streak || 0;
  return Math.min(100, streak * 10 + 30);
}
