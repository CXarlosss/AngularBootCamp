import { supabase } from '@/core/services/supabaseClient';
import { addDays } from 'date-fns';
import { waysMasterData } from '@/data/ways-master-data';
import type { CompletedWayInfo } from './pdfExportService';

export class ClinicalAnnexPrefill {
  static async getWeeklyCompletedWays(patientId: string, weekStart: string): Promise<CompletedWayInfo[]> {
    if (!supabase) return [];
    
    const weekEnd = addDays(new Date(weekStart), 6).toISOString();
    
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('action, metadata, created_at')
      .eq('patient_id', patientId)
      .eq('action', 'way_completed')
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd);

    if (!logs) return [];

    const completedWays: CompletedWayInfo[] = [];

    // Map logs to ways
    for (const log of logs) {
      const wayId = log.metadata?.wayId || log.metadata?.id;
      if (!wayId) continue;
      
      const wayData = waysMasterData.find(w => w.id === wayId);
      if (!wayData) continue;

      completedWays.push({
        id: wayId,
        title: wayData.title,
        step: wayData.step || 1,
        stepTitle: wayData.step === 1 ? 'Relajación' : wayData.step === 2 ? 'Autonomía' : 'Asertividad',
        completedAt: log.created_at,
        attempts: log.metadata?.attempts || 1,
        timeSpentSeconds: Math.round((log.metadata?.timeSpentMs || 0) / 1000),
        isHomework: !!log.metadata?.isHomework
      });
    }

    return completedWays;
  }

  static async getWeeklyMetrics(patientId: string, weekStart: string) {
    const ways = await this.getWeeklyCompletedWays(patientId, weekStart);
    
    // Group by day for sessions attended
    const daysSet = new Set(ways.map(w => w.completedAt.split('T')[0]));
    const totalTimeSeconds = ways.reduce((sum, w) => sum + w.timeSpentSeconds, 0);

    return {
      totalWaysCompleted: ways.length,
      totalTimeMinutes: Math.round(totalTimeSeconds / 60),
      sessionsAttended: daysSet.size
    };
  }

  static generateWayTags(ways: CompletedWayInfo[]) {
    // Deduplicate by wayId so we don't show the same tag twice if played twice
    const uniqueWays = Array.from(new Map(ways.map(w => [w.id, w])).values());
    
    return uniqueWays.map(w => {
      let color = '#3B82F6'; // Default blue
      let emoji = '⭐';
      
      if (w.isHomework) {
        color = '#F59E0B'; // Amber
        emoji = '🏠';
      } else if (w.step === 1) {
        color = '#10B981'; // Green
        emoji = '🧘';
      } else if (w.step === 3) {
        color = '#8B5CF6'; // Purple
        emoji = '🗣️';
      }

      return {
        id: w.id,
        label: w.title,
        emoji,
        color
      };
    });
  }

  static generateFamilySummary(metrics: any, patientName: string) {
    if (metrics.totalWaysCompleted === 0) return `Esta semana ${patientName} no ha registrado actividad.`;
    
    return `Esta semana ${patientName} ha practicado ${metrics.totalWaysCompleted} retos durante un total de ${metrics.totalTimeMinutes} minutos, distribuidos en ${metrics.sessionsAttended} días de juego. ¡Buen trabajo!`;
  }
}
