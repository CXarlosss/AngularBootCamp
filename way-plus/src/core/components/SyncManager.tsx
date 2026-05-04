import React, { useEffect } from 'react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { syncService } from '@/core/services/syncService';
import { isSupabaseAvailable } from '@/core/services/supabaseClient';

/**
 * Background component that listens to store changes and pushes to Supabase.
 * Highly defensive to prevent React hook rule violations or undefined state crashes.
 */
export function SyncManager() {
  // Use selectors with fallbacks to avoid crashes if stores aren't initialized
  const profile = usePlayerStore(s => s?.profile);
  const rewards = useRewardsStore();
  
  const completedWays = profile?.completedWays || [];
  const wayCoins = rewards?.wayCoins || 0;
  const currentAvatar = rewards?.currentAvatar;
  const currentLevel = profile?.currentLevel;

  useEffect(() => {
    if (!isSupabaseAvailable) return;
    const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
    
    const initialPull = async () => {
      try {
        console.log('[SyncManager] Initial pull for:', patientId);
        const data = await syncService.pullProgress(patientId);
        if (data) {
          usePlayerStore.getState().syncFromCloud({
            completedWays: data.completedWays,
            currentLevel: data.currentLevel as any
          });
          // Also sync rewards if they differ significantly
          if (data.coins !== rewards.wayCoins) {
            useRewardsStore.setState({ wayCoins: data.coins });
          }
          console.log('[SyncManager] Pull successful');
        }
      } catch (e) {
        console.warn('[SyncManager] Initial pull failed.', e);
      }
    };

    initialPull();
  }, [isSupabaseAvailable]);

  useEffect(() => {
    // If Supabase isn't configured or profile is missing, skip sync
    if (!isSupabaseAvailable || !profile?.id) return;

    const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
    
    const sync = async () => {
      try {
        await syncService.pushProgress({
          patientId,
          coins: wayCoins,
          inventory: (rewards?.inventory || []).map(i => i.id),
          equippedAvatarId: currentAvatar?.base || null,
          completedWays: completedWays,
          currentLevel: currentLevel || 'pregamer'
        });
      } catch (e) {
        console.warn('[SyncManager] Push failed.', e);
      }
    };

    const timer = setTimeout(() => {
      sync();
    }, 2000); // Debounce sync to avoid spamming

    return () => clearTimeout(timer);
  }, [completedWays.length, wayCoins, currentAvatar, currentLevel, profile?.id]);

  return null;
}
