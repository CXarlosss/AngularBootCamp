import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRewardsStore } from '../store/rewardsStore';
import { SECRET_CARDS } from '../data/secrets';

export const useSecretTracker = () => {
  const { 
    wayCoins, 
    streakDays, 
    unlockedSecrets, 
    unlockSecret 
  } = useRewardsStore();
  
  const location = useLocation();
  const sessionVisitedTabs = useRef<Set<string>>(new Set());
  const sessionStartTime = useRef(Date.now());

  // 1. Nocturno (00:00 - 02:00)
  useEffect(() => {
    const checkNocturnal = () => {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 2) {
        unlockSecret('sec-nocturnal');
      }
    };
    checkNocturnal();
  }, [unlockSecret]);

  // 2. El Coleccionista (Exactamente 100 monedas)
  useEffect(() => {
    if (wayCoins === 100) {
      unlockSecret('sec-collector');
    }
  }, [wayCoins, unlockSecret]);

  // 3. El Leal (Exactamente 7 días de racha)
  useEffect(() => {
    if (streakDays === 7) {
      unlockSecret('sec-loyal');
    }
  }, [streakDays, unlockSecret]);

  // 4. El Explorador (Todas las pestañas en < 10s)
  useEffect(() => {
    sessionVisitedTabs.current.add(location.pathname);
    
    const requiredTabs = ['/', '/shop', '/backpack', '/adventure'];
    const visitedAll = requiredTabs.every(tab => sessionVisitedTabs.current.has(tab));
    
    if (visitedAll) {
      const timeElapsed = (Date.now() - sessionStartTime.current) / 1000;
      if (timeElapsed < 15) { // 15s leeway
        unlockSecret('sec-explorer');
      }
    }
  }, [location.pathname, unlockSecret]);

  // Public methods to be called from components
  const trackPetClick = (count: number) => {
    if (count >= 10) {
      unlockSecret('sec-curious');
    }
  };

  const trackLoadingTime = (seconds: number) => {
    if (seconds >= 30) {
      unlockSecret('sec-patient');
    }
  };

  return { trackPetClick, trackLoadingTime };
};
