import { Injectable } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { from, Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ClientKPIs, WeekDay, ExerciseProgress } from './client-detail.types';
import { WeightEntry } from '../../../shared/components/weight-chart/weight-chart.component';

@Injectable({ providedIn: 'root' })
export class CoachClientService {
  private sb = supabase;

  getClientKPIs(clientId: string): Observable<ClientKPIs> {
    // Adherencia: días completados en las últimas 6 semanas
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const completedDays$ = from(
      this.sb
        .from('completed_days')
        .select('completed_at')
        .eq('client_id', clientId)
        .gte('completed_at', sixWeeksAgo.toISOString())
    );

    // Placeholder para peso: actualmente no parece estar en profiles de forma directa
    // pero podemos intentar traerlo del último workout_log o una tabla weight_logs
    const weightHistory$ = from(
      this.sb
        .from('set_logs')
        .select(`
          weight_kg,
          workout_logs!inner(client_id, logged_date)
        `)
        .eq('workout_logs.client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20)
    ).pipe(catchError(() => of({ data: [] })));

    return forkJoin([completedDays$, weightHistory$]).pipe(
      map(([days, weights]) => {
        const completed = days.data?.length ?? 0;
        const expected = 30; // 6 semanas × 5 días
        const adherence = Math.round((completed / expected) * 100);
        
        const weightData = weights.data as any[] || [];
        const currentWeight = weightData[0]?.weight_kg ?? null;
        // Encontrar un peso anterior diferente
        const prevWeight = weightData.find(w => w.weight_kg !== currentWeight)?.weight_kg ?? currentWeight;
        const weightDelta = currentWeight && prevWeight ? currentWeight - prevWeight : null;

        const lastWorkout = days.data && days.data.length > 0 
          ? new Date(days.data[0].completed_at) 
          : null;

        return {
          adherencePercent: Math.min(adherence, 100),
          adherenceDelta: 0, 
          daysCompleted: completed,
          daysTotal: expected,
          currentWeight,
          weightDelta,
          currentStreak: this.calculateStreak((days.data || []).map(d => ({ completed_at: d.completed_at }))),
          lastWorkoutDate: lastWorkout,
        };
      })
    );
  }

  private calculateStreak(days: { completed_at: string }[]): number {
    if (!days.length) return 0;
    const sorted = days
      .map(d => new Date(d.completed_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (sorted[i] === expected.toDateString()) {
        streak++;
      } else {
        if (i === 0) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          if (sorted[0] === yesterday.toDateString()) {
            streak++;
            continue;
          }
        }
        break;
      }
    }
    return streak;
  }

  getCurrentWeekDays(clientId: string): Observable<WeekDay[]> {
    const monday = this.getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return from(
      this.sb
        .from('completed_days')
        .select('completed_at')
        .eq('client_id', clientId)
        .gte('completed_at', monday.toISOString())
        .lte('completed_at', sunday.toISOString())
    ).pipe(
      map(({ data }) => {
        const completedDates = new Set(
          (data ?? []).map(d => new Date(d.completed_at).toDateString())
        );
        const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return labels.map((label, i) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          day.setHours(0, 0, 0, 0);
          
          const isPast = day < today;
          const isDone = completedDates.has(day.toDateString());

          return {
            label,
            status: isDone ? 'done' : (isPast ? 'missed' : 'pending'),
          } as WeekDay;
        });
      })
    );
  }

  getExerciseProgress(clientId: string): Observable<ExerciseProgress[]> {
    return from(
      this.sb
        .from('set_logs')
        .select(`
          weight_kg,
          reps_done,
          completed_at,
          exercise_name,
          workout_logs!inner(client_id)
        `)
        .eq('workout_logs.client_id', clientId)
        .not('weight_kg', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(200)
    ).pipe(
      map(({ data, error }) => {
        if (error || !data?.length) return [];

        const byExercise = new Map<string, {
          name: string;
          sets: { weight: number; reps: number; created_at: string }[]
        }>();

        for (const row of data as any[]) {
          const name: string = row.exercise_name || 'Sin nombre';
          if (!byExercise.has(name)) {
            byExercise.set(name, { name, sets: [] });
          }
          byExercise.get(name)!.sets.push({
            weight: row.weight_kg,
            reps: row.reps_done,
            created_at: row.created_at,
          });
        }

        return Array.from(byExercise.values()).map(({ name, sets }) => {
          const best = sets.reduce((max, s) =>
            s.weight > max.weight ? s : max
          );
          const first = sets[sets.length - 1];
          const daysAgo = Math.floor(
            (Date.now() - new Date(best.created_at).getTime()) / 86400000
          );

          return {
            name,
            bestWeight: best.weight,
            bestReps: best.reps,
            delta: best.weight - first.weight,
            daysAgo,
          } satisfies ExerciseProgress;
        });
      })
    );
  }

  getWeightHistory(clientId: string): Observable<WeightEntry[]> {
    return from(
      this.sb
        .from('weight_logs')
        .select('recorded_at, weight_kg')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: true })
        .limit(30)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching weight history:', error);
          return [];
        }
        return (data ?? []).map(r => ({
          recorded_at: r.recorded_at,
          weight_kg: r.weight_kg,
        }));
      }),
      catchError(() => of([]))
    );
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
