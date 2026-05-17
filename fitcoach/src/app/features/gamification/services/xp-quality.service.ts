// src/app/features/gamification/services/xp-quality.service.ts
import { Injectable, inject } from '@angular/core';
import { supabase } from '../../../core/supabase.client';

export interface XpBreakdown {
  baseXp: number;
  adherenceBonus: number;
  prBonus: number;
  techniqueBonus: number;
  streakBonus: number;
  totalXp: number;
}

@Injectable({ providedIn: 'root' })
export class XpQualityService {
  private supabase = supabase;

  /**
   * Calcular XP con calidad (nuevo sistema)
   */
  calculateQualityXp(
    sets: { weight: number; reps: number; targetWeight: number }[],
    streakWeeks: number,
    coachRating?: number // 1-5 estrellas de técnica
  ): XpBreakdown {
    const baseXp = sets.length; // +1 por serie
    
    // Adherencia: % de series que cumplen o superan objetivo
    const adheredSets = sets.filter(s => s.weight >= s.targetWeight).length;
    const adherencePct = sets.length > 0 ? adheredSets / sets.length : 0;
    const adherenceBonus = Math.floor(adherencePct * 20); // Hasta +20 XP
    
    // PR bonus: si alguna serie supera el objetivo por >5%
    const prSets = sets.filter(s => s.weight >= s.targetWeight * 1.05).length;
    const prBonus = prSets * 5;
    
    // Técnica: bonus del coach
    const techniqueBonus = coachRating ? (coachRating - 3) * 3 : 0; // -6 a +6
    
    // Racha semanal
    const streakBonus = Math.min(streakWeeks * 2, 20); // Hasta +20 XP
    
    return {
      baseXp,
      adherenceBonus,
      prBonus,
      techniqueBonus,
      streakBonus,
      totalXp: baseXp + adherenceBonus + prBonus + techniqueBonus + streakBonus
    };
  }
}
