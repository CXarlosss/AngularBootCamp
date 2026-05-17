// src/app/features/gamification/services/mission-engine.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { supabase } from '../../../core/supabase.client';

export type MissionType = 'frequency' | 'volume' | 'quality' | 'social';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
  progressPct: number;
  difficulty: number;
}

@Injectable({ providedIn: 'root' })
export class MissionEngineService {
  private supabase = supabase;
  
  private missions = signal<Mission[]>([]);
  private isLoading = signal(false);
  
  readonly activeMissions = computed(() => 
    this.missions().filter(m => !m.isClaimed)
  );
  
  readonly completedCount = computed(() => 
    this.missions().filter(m => m.isCompleted).length
  );
  
  readonly totalXpAvailable = computed(() => 
    this.missions()
      .filter(m => !m.isClaimed)
      .reduce((sum, m) => sum + m.xpReward, 0)
  );

  /**
   * Generar misiones para la semana actual (llamar cada lunes 00:00 via cron/edge function)
   */
  async generateWeeklyMissions(clientId: string): Promise<void> {
    const weekStart = this.getWeekStart();
    
    // Verificar si ya tiene misiones esta semana
    const { data: existing } = await this.supabase
      .from('client_missions')
      .select('id')
      .eq('client_id', clientId)
      .eq('week_start', weekStart)
      .limit(1);
    
    if (existing && existing.length > 0) return;
    
    // Obtener templates activos
    const { data: templates } = await this.supabase
      .from('mission_templates')
      .select('*')
      .eq('is_active', true);
    
    if (!templates) return;
    
    // Seleccionar 3 misiones: 1 fácil, 1 media, 1 difícil (o random si no hay de cada)
    const byDifficulty: Record<number, any[]> = {
      1: templates.filter(t => t.difficulty === 1),
      2: templates.filter(t => t.difficulty === 2),
      3: templates.filter(t => t.difficulty === 3)
    };
    
    const selected = [
      this.randomPick(byDifficulty[1]),
      this.randomPick(byDifficulty[2]),
      this.randomPick(byDifficulty[3])
    ].filter((t): t is any => t !== null);
    
    // Insertar
    const inserts = selected.map(t => ({
      client_id: clientId,
      mission_template_id: t.id,
      week_start: weekStart,
      target_value: t.target_value,
      xp_reward: t.xp_reward
    }));
    
    await this.supabase.from('client_missions').insert(inserts);
  }

  /**
   * Cargar misiones del cliente
   */
  async loadMissions(clientId: string): Promise<void> {
    this.isLoading.set(true);
    
    const weekStart = this.getWeekStart();
    
    const { data } = await this.supabase
      .from('client_missions')
      .select(`
        id,
        target_value,
        current_value,
        xp_reward,
        is_completed,
        is_claimed,
        mission_templates (
          type,
          title,
          description,
          icon,
          difficulty
        )
      `)
      .eq('client_id', clientId)
      .eq('week_start', weekStart);
    
    const mapped: Mission[] = (data || []).map((row: any) => ({
      id: row.id,
      type: row.mission_templates.type,
      title: row.mission_templates.title,
      description: row.mission_templates.description,
      targetValue: row.target_value,
      currentValue: row.current_value,
      xpReward: row.xp_reward,
      icon: row.mission_templates.icon,
      isCompleted: row.is_completed,
      isClaimed: row.is_claimed,
      progressPct: Math.min(100, (row.current_value / row.target_value) * 100),
      difficulty: row.mission_templates.difficulty
    }));
    
    this.missions.set(mapped);
    this.isLoading.set(false);
  }

  /**
   * Actualizar progreso de una misión (llamar desde telemetry o workout completion)
   */
  async updateProgress(
    clientId: string, 
    type: MissionType, 
    increment: number
  ): Promise<void> {
    const weekStart = this.getWeekStart();
    
    const { data: mission } = await this.supabase
      .from('client_missions')
      .select('id, current_value, target_value, is_completed')
      .eq('client_id', clientId)
      .eq('week_start', weekStart)
      .eq('mission_templates.type', type)
      .single();
    
    if (!mission || mission.is_completed) return;
    
    const newValue = mission.current_value + increment;
    const isCompleted = newValue >= mission.target_value;
    
    await this.supabase
      .from('client_missions')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', mission.id);
    
    // Si se completó, notificar
    if (isCompleted) {
      // Trigger notificación local o push
      this.showCompletionToast(mission.id);
    }
  }

  /**
   * Reclamar XP de misiones completadas
   */
  async claimXp(clientId: string, missionId: string): Promise<number> {
    const { data: mission } = await this.supabase
      .from('client_missions')
      .select('xp_reward, is_completed, is_claimed')
      .eq('id', missionId)
      .single();
    
    if (!mission || !mission.is_completed || mission.is_claimed) {
      return 0;
    }
    
    await this.supabase
      .from('client_missions')
      .update({ is_claimed: true })
      .eq('id', missionId);
    
    // Añadir XP al usuario
    await this.supabase.rpc('add_xp', {
      p_client_id: clientId,
      p_mission_xp: mission.xp_reward
    });
    
    return mission.xp_reward;
  }

  private getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }

  private randomPick<T>(arr: T[]): T | null {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private showCompletionToast(missionId: string): void {
    // Integrar con tu sistema de toasts
    console.log(`Mission ${missionId} completed!`);
  }
}
