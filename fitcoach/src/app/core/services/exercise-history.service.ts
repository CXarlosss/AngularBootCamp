import { Injectable, inject } from '@angular/core';
import { WorkoutStore } from '../../state/workout.store';
import { SetLog } from '../models/workout-log.model';

export interface WeeklyStats {
  weekLabel: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: SetLog | null;
  date: Date;
  sets: SetLog[];
}

export interface ExerciseHistoryContext {
  thisWeek: WeeklyStats | null;
  lastWeek: WeeklyStats | null;
  pr: { weight: number, reps: number, date: Date } | null;
  sparklineData: number[];
  progressionKg: number;
}

@Injectable({ providedIn: 'root' })
export class ExerciseHistoryService {
  private workoutStore = inject(WorkoutStore);

  getExerciseHistory(exerciseId: string, exerciseName?: string): ExerciseHistoryContext {
    const rawLogs = this.workoutStore.allLogsForExercise(exerciseId, exerciseName);
    if (!rawLogs || rawLogs.length === 0) {
      return {
        thisWeek: null,
        lastWeek: null,
        pr: null,
        sparklineData: [],
        progressionKg: 0
      };
    }

    // Sort logs descending by date
    const sortedLogs = [...rawLogs].sort((a, b) => b.date.getTime() - a.date.getTime());

    let prWeight = 0;
    let prReps = 0;
    let prDate = new Date();
    
    // Group by week (roughly by workout session for simplicity or actual ISO week)
    // Here we'll treat each workout session as a "week" or group to compare last vs this
    const sessions = sortedLogs.map(log => {
      const maxWeight = Math.max(...log.sets.map(s => s.weightKg || 0));
      const totalVolume = log.sets.reduce((acc, s) => acc + ((s.weightKg || 0) * (s.repsDone || 0)), 0);
      
      const bestSet = log.sets.reduce((best, current) => {
        if (!best) return current;
        if ((current.weightKg || 0) > (best.weightKg || 0)) return current;
        if ((current.weightKg || 0) === (best.weightKg || 0) && (current.repsDone || 0) > (best.repsDone || 0)) return current;
        return best;
      }, null as SetLog | null);

      return {
        weekLabel: log.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        maxWeight,
        totalVolume,
        bestSet,
        date: log.date,
        sets: log.sets
      };
    });

    // Calculate PR over all history
    sessions.forEach(session => {
      if (session.bestSet && session.bestSet.weightKg >= prWeight) {
        if (session.bestSet.weightKg > prWeight || session.bestSet.repsDone > prReps) {
           prWeight = session.bestSet.weightKg;
           prReps = session.bestSet.repsDone;
           prDate = session.date;
        }
      }
    });

    const thisWeek = sessions.length > 0 ? sessions[0] : null;
    const lastWeek = sessions.length > 1 ? sessions[1] : null;
    
    // Last 4 sessions max weights for sparkline
    const sparklineData = sessions.slice(0, 4).map(s => s.maxWeight).reverse();

    const progressionKg = (thisWeek && lastWeek) 
      ? (thisWeek.maxWeight - lastWeek.maxWeight) 
      : 0;

    return {
      thisWeek,
      lastWeek,
      pr: prWeight > 0 ? { weight: prWeight, reps: prReps, date: prDate } : null,
      sparklineData,
      progressionKg
    };
  }
}
