import { useEffect, useState } from 'react';
import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';

/**
 * useStreakDays
 * Calcula la racha de días consecutivos de actividad basándose
 * exclusivamente en los registros de 'activity_logs'.
 * 
 * Es una propiedad derivada, no persistida directamente.
 */
export function useStreakDays(patientId: string | null): number {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!patientId || !isSupabaseAvailable) {
      setStreak(0);
      return;
    }

    const calculate = async () => {
      // Obtenemos los logs de completado ordenados por fecha
      if (!supabase) return;
      const { data, error } = await supabase
        .from('activity_logs')
        .select('created_at')
        .eq('patient_id', patientId)
        .eq('action', 'way_completed')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setStreak(0);
        return;
      }

      // Extraer días únicos en formato YYYY-MM-DD
      const days = new Set(
        data.map(row => new Date(row.created_at).toISOString().split('T')[0])
      );

      const sortedDays = Array.from(days).sort().reverse();
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Si no ha jugado ni hoy ni ayer, la racha es 0
      const mostRecent = sortedDays[0];
      if (mostRecent !== today && mostRecent !== yesterday) {
        setStreak(0);
        return;
      }

      // Contar hacia atrás desde el día más reciente de actividad
      let streakCount = 0;
      let checkDate = new Date(mostRecent);

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (days.has(dateStr)) {
          streakCount++;
          // Restar un día
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(streakCount);
    };

    calculate();
  }, [patientId]);

  return streak;
}
