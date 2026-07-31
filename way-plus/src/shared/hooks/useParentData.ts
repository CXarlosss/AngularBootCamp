/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useParentData — Datos del niño para el panel familiar
 * En producción: conecta con PostHog API o tu backend
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';

export interface WeeklySummary {
  weekLabel: string;
  sessionsCount: number;
  totalMinutes: number;
  levelsCompleted: number;
  averageScore: number;
  streakDays: number;
  moodTrend: 'happy' | 'neutral' | 'frustrated';
  topAchievement: string;
}

export interface ParentTip {
  id: string;
  category: 'communication' | 'routine' | 'encouragement' | 'rest';
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ChildSnapshot {
  name: string;
  avatar: string;
  characterName: string;
  characterEmoji: string;
  currentLevel: number;
  totalStars: number;
  totalCoins: number;
  weeklyProgress: number[]; // 7 días, 0-100
  lastSession: string;
  nextMilestone: string;
}

export interface ParentData {
  child: ChildSnapshot;
  thisWeek: WeeklySummary;
  lastWeek: WeeklySummary;
  tips: ParentTip[];
  recentAchievements: { date: string; title: string; emoji: string }[];
  therapistNote?: string;
}

export function useParentData(childId: string): { data: ParentData | null; isLoading: boolean } {
  const [data, setData] = useState<ParentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de fetch. En producción: fetch('/api/parent/child/:id/summary')
    const timer = setTimeout(() => {
      setData({
        child: {
          name: 'Lucía',
          avatar: '👧',
          characterName: 'Luna',
          characterEmoji: '🦊',
          currentLevel: 5,
          totalStars: 47,
          totalCoins: 320,
          weeklyProgress: [80, 65, 90, 100, 75, 85, 60],
          lastSession: 'Hoy, 10:30',
          nextMilestone: 'Nivel 6: El Castillo',
        },
        thisWeek: {
          weekLabel: 'Esta semana',
          sessionsCount: 5,
          totalMinutes: 64,
          levelsCompleted: 3,
          averageScore: 82,
          streakDays: 5,
          moodTrend: 'happy',
          topAchievement: 'Completó el Bosque Encantado sin ayuda',
        },
        lastWeek: {
          weekLabel: 'Semana pasada',
          sessionsCount: 3,
          totalMinutes: 38,
          levelsCompleted: 1,
          averageScore: 68,
          streakDays: 2,
          moodTrend: 'neutral',
          topAchievement: 'Mantuvo racha de 2 días',
        },
        tips: [
          {
            id: 't1',
            category: 'encouragement',
            title: 'Celebrar el esfuerzo, no solo el resultado',
            body: 'Lucía ha mejorado su puntuación un 14% esta semana. Dile que notaste que sigue intentándolo, incluso cuando los niveles se ponen difíciles.',
            actionLabel: 'Ver conversación sugerida',
          },
          {
            id: 't2',
            category: 'routine',
            title: 'El mejor horario para jugar',
            body: 'Sus sesiones más largas y exitosas son por la tarde (después del colegio). Intenta reservar 15 minutos entre las 16:00 y las 17:00.',
          },
          {
            id: 't3',
            category: 'rest',
            title: 'Modo Zen antes de dormir',
            body: 'Si juega después de las 20:00, usa el Modo Zen de 5 minutos para ayudarle a bajar la energía antes de la cama.',
          },
        ],
        recentAchievements: [
          { date: 'Hoy', title: 'Nivel 5 completado', emoji: '🏆' },
          { date: 'Ayer', title: 'Racha de 5 días', emoji: '🔥' },
          { date: 'Hace 3 días', title: 'Cofre diario especial', emoji: '🎁' },
        ],
        therapistNote: 'Lucía está mostrando mucha mejora en la persistencia. Refuercen en casa el valor del "intento" cuando no lo consigue a la primera.',
      });
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [childId]);

  return { data, isLoading };
}
