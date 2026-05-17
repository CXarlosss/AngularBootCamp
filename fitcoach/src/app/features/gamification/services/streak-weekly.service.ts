// src/app/features/gamification/services/streak-weekly.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { supabase } from '../../../core/supabase.client';

export interface WeeklyStreak {
  currentStreak: number;
  weekProgress: number; // 0-100%
  daysCompleted: number;
  targetDays: number;
  freezeUsed: boolean;
  freezeAutoApplied: boolean;
  isAtRisk: boolean;
  weekStatus: 'on_track' | 'at_risk' | 'saved_by_freeze' | 'broken';
}

@Injectable({ providedIn: 'root' })
export class StreakWeeklyService {
  private supabase = supabase;
  private readonly TARGET_DAYS = 3;
  
  private streak = signal<WeeklyStreak | null>(null);
  readonly currentStreak = computed(() => this.streak());

  async calculateStreak(clientId: string): Promise<WeeklyStreak> {
    const currentWeekStart = this.getWeekStart();
    
    // Obtener semanas recientes (últimas 8 semanas)
    const { data: weeks } = await this.supabase
      .from('weekly_streaks')
      .select('*')
      .eq('client_id', clientId)
      .order('week_start', { ascending: false })
      .limit(8);
    
    let streakCount = 0;
    let consecutive = true;
    
    for (const week of weeks || []) {
      const metTarget = week.days_completed >= this.TARGET_DAYS;
      const usedFreeze = week.freeze_used;
      
      if (metTarget) {
        streakCount++;
      } else if (usedFreeze) {
        // Freeze salvó la semana
        streakCount++;
      } else {
        if (consecutive && weeks && weeks.length > 0 && week.week_start === currentWeekStart) {
            // La semana actual aún no termina, no rompe la racha de las anteriores
            continue;
        }
        consecutive = false;
        break;
      }
    }
    
    // Semana actual
    const currentWeek = weeks?.find(w => w.week_start === currentWeekStart) || {
      days_completed: 0,
      target_days: this.TARGET_DAYS,
      freeze_used: false,
      freeze_auto_applied: false
    };
    
    const daysNeeded = Math.max(0, (currentWeek.target_days || this.TARGET_DAYS) - currentWeek.days_completed);
    const weekProgress = (currentWeek.days_completed / (currentWeek.target_days || this.TARGET_DAYS)) * 100;
    
    let weekStatus: WeeklyStreak['weekStatus'] = 'on_track';
    if (currentWeek.days_completed >= (currentWeek.target_days || this.TARGET_DAYS)) {
      weekStatus = 'on_track';
    } else if (currentWeek.freeze_used) {
      weekStatus = 'saved_by_freeze';
    } else if (daysNeeded > 2) { 
      weekStatus = 'at_risk';
    }
    
    const result: WeeklyStreak = {
      currentStreak: streakCount,
      weekProgress,
      daysCompleted: currentWeek.days_completed,
      targetDays: currentWeek.target_days || this.TARGET_DAYS,
      freezeUsed: currentWeek.freeze_used,
      freezeAutoApplied: currentWeek.freeze_auto_applied,
      isAtRisk: weekStatus === 'at_risk',
      weekStatus
    };
    
    this.streak.set(result);
    return result;
  }

  /**
   * Registrar día completado (llamar desde workout completion)
   */
  async recordDay(clientId: string): Promise<void> {
    const weekStart = this.getWeekStart();
    
    // Upsert: crear o actualizar
    const { data: existing } = await this.supabase
      .from('weekly_streaks')
      .select('id, days_completed, freeze_used')
      .eq('client_id', clientId)
      .eq('week_start', weekStart)
      .maybeSingle();
    
    if (existing) {
      const newDays = existing.days_completed + 1;
      await this.supabase
        .from('weekly_streaks')
        .update({ days_completed: newDays })
        .eq('id', existing.id);
    } else {
      await this.supabase.from('weekly_streaks').insert({
        client_id: clientId,
        week_start: weekStart,
        days_completed: 1,
        target_days: this.TARGET_DAYS
      });
    }
    
    // Recalcular
    await this.calculateStreak(clientId);
  }

  /**
   * Auto-aplicar freeze si la semana termina sin cumplir objetivo
   * (Llamar desde cron job cada domingo a las 23:59)
   */
  async autoApplyFreeze(clientId: string): Promise<void> {
    const weekStart = this.getWeekStart();
    
    const { data: week } = await this.supabase
      .from('weekly_streaks')
      .select('id, days_completed, target_days, freeze_used')
      .eq('client_id', clientId)
      .eq('week_start', weekStart)
      .maybeSingle();
    
    if (!week || week.days_completed >= week.target_days) return;
    if (week.freeze_used) return;
    
    // Aplicar freeze automático
    await this.supabase
      .from('weekly_streaks')
      .update({
        freeze_used: true,
        freeze_auto_applied: true
      })
      .eq('id', week.id);
  }

  private getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }
}
