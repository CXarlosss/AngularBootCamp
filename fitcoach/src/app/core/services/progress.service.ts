import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from '../auth/auth.service';

export interface ProgressStats {
  adherencePercent: number;
  currentStreak: number;
  totalDaysCompleted: number;
  bestWeightImprovement: number | null;
  weeklyAdherence: WeeklyBar[];
}

export interface WeeklyBar {
  weekLabel: string;
  percent: number;
  completed: number;
  expected: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private sb   = supabase;
  private auth = inject(AuthService);

  async getStats(): Promise<ProgressStats> {
    const userId = this.auth.user()?.id;
    if (!userId) return this.emptyStats();

    const [adherence, improvement] = await Promise.all([
      this.getAdherenceData(userId),
      this.getBestImprovement(userId),
    ]);

    return { ...adherence, bestWeightImprovement: improvement };
  }

  // ─── Adherencia ────────────────────────────────────────────────────────────

  private async getAdherenceData(userId: string): Promise<Omit<ProgressStats, 'bestWeightImprovement'>> {
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    // Intentar completed_days primero
    const { data: cdData } = await this.sb
      .from('completed_days')
      .select('completed_at')
      .eq('client_id', userId)
      .gte('completed_at', sixWeeksAgo.toISOString());

    // Fallback a workout_logs si completed_days está vacío
    let rows: { completed_at: string }[] = cdData ?? [];

    if (!rows.length) {
      const { data: wlData } = await this.sb
        .from('workout_logs')
        .select('created_at')
        .eq('client_id', userId)
        .eq('completed', true)
        .gte('created_at', sixWeeksAgo.toISOString());

      rows = (wlData ?? []).map((r) => ({ completed_at: r.created_at }));
    }

    const uniqueDays = new Set(
      rows.map((r) => new Date(r.completed_at).toDateString()),
    );

    const totalDaysCompleted = uniqueDays.size;
    const currentStreak = this.calcStreak(uniqueDays);

    const expected = 30; // 6 semanas * 5 días
    const adherencePercent = Math.min(
      100,
      Math.round((totalDaysCompleted / expected) * 100),
    );

    // Mapear para las barras semanales
    const weeklyAdherence = this.calcWeeklyBars(rows);

    return {
      adherencePercent,
      currentStreak,
      totalDaysCompleted,
      weeklyAdherence,
    };
  }

  private calcStreak(uniqueDays: Set<string>): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (uniqueDays.has(d.toDateString())) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  private calcWeeklyBars(rows: { completed_at: string }[]): WeeklyBar[] {
    const bars: WeeklyBar[] = [];
    const today = new Date();

    for (let w = 5; w >= 0; w--) {
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
      weekStart.setDate(today.getDate() - dayOfWeek - w * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const daysInWeek = new Set(
        rows
          .filter(r => {
            const d = new Date(r.completed_at);
            return d >= weekStart && d <= weekEnd;
          })
          .map(r => new Date(r.completed_at).toDateString())
      );

      const completed = daysInWeek.size;
      const expected  = w === 0 ? Math.min(dayOfWeek + 1, 5) : 5;

      bars.push({
        weekLabel: `S${6 - w}`,
        percent: expected > 0 ? Math.round((completed / expected) * 100) : 0,
        completed,
        expected,
      });
    }

    return bars;
  }

  // ─── Mejora de peso en ejercicios ──────────────────────────────────────────

  private async getBestImprovement(userId: string): Promise<number | null> {
    // Paso 1: workout_log IDs del usuario — ✅ client_id
    const { data: logs } = await this.sb
      .from('workout_logs')
      .select('id')
      .eq('client_id', userId);

    if (!logs?.length) return null;

    // Paso 2: set_logs — ✅ weight_kg, completed_at
    const { data: sets, error } = await this.sb
      .from('set_logs')
      .select(`
        exercise_id, 
        weight_kg, 
        completed_at
      `)
      .in('workout_log_id', logs.map(l => l.id))
      .not('weight_kg', 'is', null)
      .order('completed_at', { ascending: true });

    if (error || !sets?.length) return null;

    const byExercise = new Map<string, number[]>();
    for (const s of sets) {
      const key = s.exercise_id;
      if (!byExercise.has(key)) byExercise.set(key, []);
      byExercise.get(key)!.push(s.weight_kg);
    }

    let bestDelta = 0;
    for (const weights of byExercise.values()) {
      if (weights.length < 2) continue;
      const delta = weights[weights.length - 1] - weights[0];
      if (delta > bestDelta) bestDelta = delta;
    }

    return bestDelta > 0 ? +bestDelta.toFixed(1) : null;
  }

  // ─── Legacy methods ────────────────────────────────────────────────────────

  async getExerciseProgress(clientId: string): Promise<any[]> {
    const { data } = await this.sb
      .from('set_logs')
      .select('weight_kg, reps_done, exercise_name, completed_at, workout_logs(logged_date)')
      .eq('workout_logs.client_id', clientId);

    const map = new Map<string, any[]>();
    for (const row of data || []) {
      const name = row.exercise_name;
      if (!name) continue;
      if (!map.has(name)) map.set(name, []);
      
      const dateStr = (row.workout_logs as any)?.logged_date || row.completed_at;
      if (!dateStr) continue;

      map.get(name)!.push({
        date: new Date(dateStr),
        maxWeight: row.weight_kg,
        totalVol: row.weight_kg * row.reps_done
      });
    }

    return [...map.entries()].map(([name, dataPoints]) => ({ name, dataPoints }));
  }

  async getWeeklyAdherence(clientId: string): Promise<number[]> {
    const stats = await this.getStats();
    return stats.weeklyAdherence.map(w => w.percent);
  }

  async getProgressPhotos(clientId: string): Promise<any[]> {
    const { data } = await this.sb
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_date', { ascending: false });
    
    return Promise.all((data || []).map(async (row) => ({
      id: row.id,
      url: await this.getSignedUrl(row.storage_path),
      takenAt: new Date(row.taken_date)
    })));
  }

  async getSignedUrl(path: string): Promise<string> {
    const { data } = await this.sb.storage.from('progress-photos').createSignedUrl(path, 3600);
    return data?.signedUrl ?? '';
  }

  async uploadPhoto(clientId: string, file: File): Promise<any> {
    const path = `${clientId}/${Date.now()}_${file.name}`;
    await this.sb.storage.from('progress-photos').upload(path, file);
    
    const { data } = await this.sb.from('progress_photos').insert({
      client_id: clientId,
      storage_path: path,
      taken_date: new Date().toISOString().split('T')[0]
    }).select().single();

    return {
      id: data?.id,
      url: await this.getSignedUrl(path),
      takenAt: new Date()
    };
  }

  private emptyStats(): ProgressStats {
    return {
      adherencePercent: 0,
      currentStreak: 0,
      totalDaysCompleted: 0,
      bestWeightImprovement: null,
      weeklyAdherence: [],
    };
  }

  private emptyAdherence() {
    return {
      adherencePercent: 0,
      currentStreak: 0,
      totalDaysCompleted: 0,
      weeklyAdherence: [] as WeeklyBar[],
    };
  }
}
