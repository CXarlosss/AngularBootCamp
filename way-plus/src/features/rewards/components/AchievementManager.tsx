import React, { useEffect } from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { STICKERS_CATALOG } from '../data/collections';

/**
 * AchievementManager monitors player progress and unlocks stickers automatically.
 */
export function AchievementManager() {
  const profile = usePlayerStore(s => s.profile);
  const { ownedStickers, unlockSticker, totalXp } = useRewardsStore();

  useEffect(() => {
    if (!profile || !unlockSticker) return;

    const completedWays = profile.completedWays || [];
    const ownedIds = Object.keys(ownedStickers || {});
    const streak = profile.streakDays || 0;
    const totalXP = totalXp || 0;

    // Helper function to count completions by theme
    const countByTheme = (theme: string) => {
      // Use partial string matching on the ID as a proxy for the theme
      return completedWays.filter(id => id.toLowerCase().includes(theme.toLowerCase())).length;
    };

    const unlocks: { id: string; condition: boolean }[] = [
      // --- SERIE ORIGINAL ---
      { id: 'card-001', condition: countByTheme('relaxation') >= 1 },
      { id: 'card-002', condition: countByTheme('bravery') >= 1 },
      { id: 'card-003', condition: countByTheme('social') >= 1 },
      { id: 'card-004', condition: countByTheme('autonomy') >= 1 },
      { id: 'card-005', condition: countByTheme('relaxation') >= 2 },
      { id: 'card-006', condition: countByTheme('social') >= 2 },

      // --- SERIE ESPECIAL ---
      { id: 'card-patience-seed', condition: completedWays.length >= 3 },
      { id: 'card-star-day', condition: streak >= 3 },
      { id: 'card-lion-courage', condition: countByTheme('autonomy') >= 3 },
      { id: 'card-rainbow-bridge', condition: countByTheme('relaxation') >= 3 },
      { id: 'card-focus-arrow', condition: completedWays.length >= 5 },
      { id: 'card-helping-hand', condition: countByTheme('social') >= 3 },
      
      // --- HITOS ---
      { id: 'card-master-piece', condition: ownedIds.length >= 10 },
      { id: 'card-classroom-hero', condition: completedWays.length >= 15 },
      { id: 'card-double-face', condition: countByTheme('social') >= 5 },
      { id: 'card-inner-fire', condition: countByTheme('bravery') >= 3 },
      
      // --- EXPLORACIÓN ---
      { id: 'card-explorer-map', condition: completedWays.length >= 1 },
      { id: 'card-mirror-truth', condition: totalXP >= 100 },
      { id: 'card-time-hourglass', condition: totalXP >= 500 },
      { id: 'card-trophy-champion', condition: totalXP >= 1000 },
    ];

    // Execute unlocks
    unlocks.forEach(u => {
      if (u.condition && !ownedIds.includes(u.id)) {
        console.log(`[AchievementManager] Unlocking: ${u.id}`);
        unlockSticker(u.id);
      }
    });

  }, [profile?.completedWays, profile?.streakDays, totalXp, ownedStickers, unlockSticker]);

  return null;
}
