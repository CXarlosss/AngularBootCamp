import { useState } from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';

export const useWayEngine = (wayId: string) => {
  const [state, setState] = useState<'playing' | 'answered'>('playing');
  const completeWay = usePlayerStore((s) => s.completeWay);
  const celebrateCompletion = useRewardsStore((s) => s.celebrateCompletion);

  const submitAnswer = (status: 'correct' | 'incorrect', attempts: number = 1) => {
    if (status === 'correct') {
      setState('answered');
      completeWay(wayId, attempts);
      celebrateCompletion('way');
    } else {
      // Manejar error visual en la estrategia
    }
  };

  return {
    state,
    submitAnswer
  };
};
