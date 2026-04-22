import { useMemo } from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { ALL_STEPS } from '@/content/registry';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  wayId: string;
  levelId: string;
  stepId: string;
  reward: { coins: number; xp: number };
  completed: boolean;
}

export function useDailyQuests(): DailyQuest[] {
  const completedWays = usePlayerStore((s) => s.profile.completedWays);
  
  return useMemo(() => {
    const allSteps = Object.values(ALL_STEPS);
    const allWays = allSteps.flatMap(s => s.ways.map(w => ({ ...w, stepId: s.id })));
    
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    // Seleccionar 3 ways aleatorios usando el seed para que sean consistentes hoy
    const pool = allWays;
    if (pool.length === 0) return [];

    const selectedIndices: number[] = [];
    for (let i = 0; i < Math.min(3, pool.length); i++) {
      const idx = (seed + i * 13) % pool.length;
      if (!selectedIndices.includes(idx)) {
        selectedIndices.push(idx);
      }
    }
    
    const selected = selectedIndices.map(idx => pool[idx]);
    
    return selected.map((way, idx) => ({
      id: `daily-${today}-${way.id}`,
      title: [`🌅 Reto de Mañana`, `☀️ Reto de Mediodía`, `🌙 Reto de Noche`][idx],
      description: way.stimulus.text || 'Realiza este reto para ganar premios',
      wayId: way.id,
      levelId: (way as any).levelId || 'pregamer',
      stepId: way.stepId,
      reward: { coins: 20 + (idx * 10), xp: 30 + (idx * 15) },
      completed: completedWays.includes(way.id),
    }));
  }, [completedWays]);
}
