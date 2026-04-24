import React, { useEffect } from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { syncService } from '@/core/services/syncService';
import { isSupabaseAvailable } from '@/core/services/supabaseClient';

/**
 * Background component that listens to store changes and pushes to Supabase.
 */
export function SyncManager() {
  const profile = usePlayerStore(s => s.profile);
  const rewards = useRewardsStore();
  
  const completedCount = (profile?.completedWays || []).length;
  const wayCoins = rewards?.wayCoins || 0;
  const currentAvatar = rewards?.currentAvatar;
  const currentLevel = profile?.currentLevel;

  useEffect(() => {
    if (!isSupabaseAvailable || !profile) return;

    const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
    
    const sync = async () => {
      try {
        await syncService.pushProgress({
          patientId,
          coins: wayCoins,
          inventory: (rewards?.inventory || []).map(i => i.id),
          equippedAvatarId: currentAvatar?.base || null,
          completedWays: profile.completedWays || [],
          currentLevel: currentLevel || 'pregamer'
        });
      } catch (e) {
        console.warn('[SyncManager] Push failed.', e);
      }
    };

    sync();
  }, [completedCount, wayCoins, currentAvatar, currentLevel, profile]);

  return null;
}
