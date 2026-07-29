import { useState, useCallback } from 'react';
import type { DailyReward } from '../utils/dailyChestUtils';
import { getRandomReward, isChestAvailable } from '../utils/dailyChestUtils';
import { audioService } from '@/core/utils/audioService';
import { hapticService } from '@/core/services/hapticService';

export function useDailyChest(lastOpenedDate: string | null, onClaim: (reward: DailyReward) => void) {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<DailyReward | null>(null);
  const [showModal, setShowModal] = useState(false);

  const available = lastOpenedDate ? isChestAvailable(lastOpenedDate) : true;

  const openChest = useCallback(() => {
    if (!available || isOpening) return;
    setIsOpening(true);
    audioService.playSFX('success');
    hapticService.click();
    setTimeout(() => {
      const newReward = getRandomReward();
      setReward(newReward);
      setIsOpening(false);
      hapticService.celebration();
      setShowModal(true);
    }, 1500);
  }, [available, isOpening]);

  const claimReward = useCallback(() => {
    if (reward) {
      onClaim(reward);
      setReward(null);
      setShowModal(false);
    }
  }, [reward, onClaim]);

  return { available, isOpening, reward, showModal, openChest, claimReward, setShowModal };
}
