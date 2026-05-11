// src/app/features/gamification/services/leaderboard.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  rank: number;
  clientId: string;
  clientName: string;
  avatarUrl?: string;
  value: number;
  isCurrentUser: boolean;
  trend: 'up' | 'down' | 'same';
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private supabase = inject(SupabaseClient);

  async getLeaderboard(
    coachId: string,
    metric: 'xp' | 'adherence' | 'prs' = 'xp',
    weekStart?: string
  ): Promise<LeaderboardEntry[]> {
    const week = weekStart || this.getWeekStart();
    
    // Usar materialized view o función RPC para performance
    const { data } = await this.supabase
      .rpc('get_coach_leaderboard', {
        p_coach_id: coachId,
        p_week_start: week,
        p_metric: metric
      });
    
    return (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      clientId: row.client_id,
      clientName: row.full_name,
      avatarUrl: row.avatar_url,
      value: row.value,
      isCurrentUser: false, // Comparar con auth.uid() en el componente si es necesario
      trend: row.trend || 'same'
    }));
  }

  private getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }
}
