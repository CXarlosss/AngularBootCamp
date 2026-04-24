import { useState, useCallback } from 'react';
import type { StreakMilestone } from '../utils/streakUtils';
import { STREAK_MILESTONES, canClaimDailyBonus, getDailyBonus } from '../utils/streakUtils';
import { audioService } from '@/core/utils/audioService';

export function useStreak(
  streakDays: number, 
  lastBonusDate: string | null,
  onClaim: (coins: number) => void,
  onMilestone: (milestone: StreakMilestone) => void
) {
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<StreakMilestone | null>(null);

  const available = canClaimDailyBonus(lastBonusDate);

  const claimBonus = useCallback(() => {
    if (!available) return;
    
    const bonus = getDailyBonus(streakDays);
    onClaim(bonus);
    audioService.playSFX('coin');

    // Check if a milestone was reached today
    const milestone = STREAK_MILESTONES.find(m => m.day === streakDays);
    if (milestone) {
      setActiveMilestone(milestone);
      setShowMilestoneModal(true);
      audioService.playSFX('milestone');
    }
  }, [available, streakDays, onClaim]);

  const handleCloseMilestone = () => {
    if (activeMilestone) {
      onMilestone(activeMilestone);
      setShowMilestoneModal(false);
      setActiveMilestone(null);
    }
  };

  return {
    available,
    showMilestoneModal,
    activeMilestone,
    claimBonus,
    handleCloseMilestone
  };
}
