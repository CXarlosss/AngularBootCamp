import { supabase } from '@/core/services/supabaseClient';

export interface WayMetrics {
  wayId: string;
  completions: number;
  totalAttempts: number;
  avgAttempts: number;
  avgTimeSec: number;
  lastPlayed: string;
  category: string;
}

export const analyticsService = {
  /**
   * Obtiene el desglose detallado por cada Way jugado por el paciente.
   */
  async getWayBreakdown(patientId: string): Promise<WayMetrics[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('activity_logs')
      .select('way_id, action, attempts, metadata, created_at')
      .eq('patient_id', patientId)
      .eq('action', 'way_completed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Agrupar por way_id
    const byWay = data.reduce((acc, row) => {
      if (!acc[row.way_id]) {
        acc[row.way_id] = {
          wayId: row.way_id,
          completions: 0,
          totalAttempts: 0,
          totalTimeMs: 0,
          dates: [],
          category: row.metadata?.category || 'General'
        };
      }
      acc[row.way_id].completions++;
      acc[row.way_id].totalAttempts += row.attempts || 1;
      acc[row.way_id].totalTimeMs += (row.metadata?.durationSeconds || 0) * 1000;
      acc[row.way_id].dates.push(row.created_at);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(byWay).map((w: any) => ({
      wayId: w.wayId,
      completions: w.completions,
      totalAttempts: w.totalAttempts,
      avgAttempts: Number((w.totalAttempts / w.completions).toFixed(1)),
      avgTimeSec: Math.round((w.totalTimeMs / w.completions) / 1000),
      lastPlayed: w.dates[0],
      category: w.category
    }));
  },

  /**
   * Obtiene el historial completo de actividad para exportar a CSV.
   * Incluye doble validación de seguridad: RLS + check explícito de propiedad.
   */
  async getActivityHistory(patientId: string) {
    if (!supabase) throw new Error('Supabase no disponible');

    // 1. Validar que el patientId pertenece al terapeuta logueado (Security First)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      throw new Error('Sesión no válida');
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('therapist_id', user.id)
      .single();

    if (patientError || !patient) {
      console.error('[Security] Intento de acceso no autorizado a historial:', { patientId, therapistId: user.id });
      throw new Error('No tienes permiso para ver los datos de este paciente');
    }

    // 2. Ejecutar query robusta sin dependencias de joins mágicos
    const { data, error } = await supabase
      .from('activity_logs')
      .select('created_at, way_id, action, attempts, metadata')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Mapear categorías usando el registro local (más fiable que el join)
    const { registry } = await import('@/content/registry');
    const allWays = registry.getAllWays();
    const wayMap = new Map(allWays.map(w => [w.id, w.metadata?.skillTag || 'General']));

    return (data || []).map(row => ({
      fecha: row.created_at.split('T')[0],
      way_id: row.way_id,
      categoria: wayMap.get(row.way_id) || (row.metadata as any)?.category || 'General',
      accion: row.action,
      intentos: row.attempts,
      tiempo_ms: (row.metadata as any)?.timeSpentMs || (row.metadata as any)?.durationSeconds * 1000 || 0
    }));
  }
};
