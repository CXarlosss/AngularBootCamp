import { Injectable, inject } from '@angular/core';
import { WorkoutStore } from '../../state/workout.store';
import { SetLog } from '../models/workout-log.model';

export interface WeightSuggestion {
  progressionType: 'increase_weight' | 'increase_reps' | 'maintain' | 'deload';
  confidence: 'high' | 'medium' | 'low';
  lastWeekBest: { weight: number; reps: number } | null;
  deltaFromLastWeek: number;
  suggestedWeight: number;
  suggestedReps: number;
  reasoning: string;
  oneRM: number;
  oneRMFormula: string;
  prPercent: number;
  personalRecord: { weight: number; date: string } | null;
}

export interface PRPrediction {
  confidence: number;
  currentPR: number;
  predictedPR: number;
  weeksToPR: number;
  predictedDate: string;
  trendLine: { week: number; weight: number }[];
  regressionData: { slope: number; r2: number };
}

@Injectable({ providedIn: 'root' })
export class WeightSuggestionService {
  private workoutStore = inject(WorkoutStore);

  getSuggestion(exerciseId: string, targetReps: number = 8): WeightSuggestion | null {
    const rawLogs = this.workoutStore.allLogsForExercise(exerciseId);
    if (!rawLogs || rawLogs.length < 2) return null; // Need at least last week

    const sortedLogs = [...rawLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // We want the last session that actually occurred before today, but since we're in "today's workout" 
    // the most recent log might be today's log if it has data. We'll find the most recent completed log.
    // For simplicity, let's just take sortedLogs[1] if sortedLogs[0] is today's active session, or just sortedLogs[0] if it's the real last session.
    // Assuming sortedLogs[0] is the most recent past session if today is empty, or sortedLogs[1] if today has a log.
    
    // To be safe, we'll grab the last session with actual sets.
    const validLogs = sortedLogs.filter(log => log.sets && log.sets.length > 0);
    if (validLogs.length === 0) return null;

    const lastSession = validLogs[0];
    
    const bestLastWeek = lastSession.sets.reduce((best, current) => {
      if (!best) return current;
      if ((current.weightKg || 0) > (best.weightKg || 0)) return current;
      if ((current.weightKg || 0) === (best.weightKg || 0) && (current.repsDone || 0) > (best.repsDone || 0)) return current;
      return best;
    }, null as SetLog | null);

    if (!bestLastWeek || !bestLastWeek.weightKg || !bestLastWeek.repsDone) return null;

    const lwWeight = bestLastWeek.weightKg;
    const lwReps = bestLastWeek.repsDone;

    // 1RM Calculation
    const brzycki = lwWeight / (1.0278 - 0.0278 * lwReps);
    const epley = lwWeight * (1 + lwReps / 30);
    const oneRM = Math.round((brzycki + epley) / 2);

    // Calculate overall PR
    let prWeight = 0;
    let prDate = new Date();
    validLogs.forEach(log => {
      log.sets.forEach(s => {
        if (s.weightKg && s.weightKg > prWeight) {
          prWeight = s.weightKg;
          prDate = log.date;
        }
      });
    });

    // Suggestion logic
    let suggestedWeight = lwWeight;
    let suggestedReps = lwReps;
    let progressionType: WeightSuggestion['progressionType'] = 'maintain';
    let reasoning = '';
    let delta = 0;

    if (lwReps >= targetReps + 2) {
      suggestedWeight += 2.5;
      suggestedReps = targetReps;
      progressionType = 'increase_weight';
      reasoning = `Completaste ${lwReps - targetReps} reps de sobra la semana pasada. ¡Toca subir peso!`;
      delta = 2.5;
    } else if (lwReps >= targetReps) {
      suggestedReps += 1;
      progressionType = 'increase_reps';
      reasoning = `Cumpliste el objetivo. Intenta sacar 1 rep más con el mismo peso.`;
      delta = 0;
    } else if (lwReps >= targetReps - 2) {
      progressionType = 'maintain';
      reasoning = `Estuviste cerca. Mantén el peso e intenta llegar a ${targetReps} reps.`;
      delta = 0;
    } else {
      suggestedWeight -= 2.5;
      progressionType = 'deload';
      reasoning = `Faltaron algunas reps. Bajamos un poco el peso para asegurar la técnica.`;
      delta = -2.5;
    }

    const prPercent = prWeight > 0 ? Math.round((suggestedWeight / prWeight) * 100) : 100;

    return {
      progressionType,
      confidence: validLogs.length > 3 ? 'high' : (validLogs.length > 1 ? 'medium' : 'low'),
      lastWeekBest: { weight: lwWeight, reps: lwReps },
      deltaFromLastWeek: delta,
      suggestedWeight,
      suggestedReps,
      reasoning,
      oneRM,
      oneRMFormula: 'Brzycki + Epley (Promedio)',
      prPercent,
      personalRecord: prWeight > 0 ? { weight: prWeight, date: prDate.toISOString() } : null
    };
  }

  predictPR(exerciseId: string): PRPrediction | null {
    const rawLogs = this.workoutStore.allLogsForExercise(exerciseId);
    if (!rawLogs) return null;

    const validLogs = rawLogs.filter(log => log.sets && log.sets.length > 0)
                             .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (validLogs.length < 3) return null; // Need at least 3 data points for regression

    // Map to weeks and max weights
    const startDate = validLogs[0].date.getTime();
    
    const weeklyData = new Map<number, number>();
    
    validLogs.forEach(log => {
      const week = Math.floor((log.date.getTime() - startDate) / (7 * 24 * 60 * 60 * 1000));
      const maxWeight = Math.max(...log.sets.map(s => s.weightKg || 0));
      if (!weeklyData.has(week) || maxWeight > weeklyData.get(week)!) {
        weeklyData.set(week, maxWeight);
      }
    });

    const trendLine: { week: number; weight: number }[] = Array.from(weeklyData.entries())
                                                               .map(([week, weight]) => ({ week, weight }))
                                                               .sort((a, b) => a.week - b.week);

    if (trendLine.length < 3) return null;

    // Linear Regression y = mx + b
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = trendLine.length;

    trendLine.forEach(point => {
      sumX += point.week;
      sumY += point.weight;
      sumXY += point.week * point.weight;
      sumXX += point.week * point.week;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // R^2 Calculation
    const meanY = sumY / n;
    let ssTot = 0, ssRes = 0;
    trendLine.forEach(point => {
      const predictedY = m * point.week + b;
      ssTot += Math.pow(point.weight - meanY, 2);
      ssRes += Math.pow(point.weight - predictedY, 2);
    });
    const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    // Only predict if slope is positive and R2 is somewhat okay
    if (m <= 0) return null;

    const currentPR = Math.max(...trendLine.map(t => t.weight));
    const predictedPR = currentPR + 2.5;

    // Current week relative to start
    const currentWeek = trendLine[trendLine.length - 1].week;
    
    // (predictedPR = m * x + b) => x = (predictedPR - b) / m
    const targetWeek = (predictedPR - b) / m;
    const weeksToPR = Math.max(1, Math.round(targetWeek - currentWeek));

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + weeksToPR * 7);

    let confidenceScore = (r2 * 70) + (Math.min(n, 10) / 10 * 30);
    const confidence = Math.round(Math.max(0, Math.min(100, confidenceScore)));

    // Generate trendLine data for the chart, including the predicted point
    const fullTrendLine = [...trendLine];
    fullTrendLine.push({ week: currentWeek + weeksToPR, weight: predictedPR });

    return {
      confidence,
      currentPR,
      predictedPR,
      weeksToPR,
      predictedDate: predictedDate.toISOString(),
      trendLine: fullTrendLine,
      regressionData: { slope: parseFloat(m.toFixed(2)), r2: parseFloat(r2.toFixed(2)) }
    };
  }
}
