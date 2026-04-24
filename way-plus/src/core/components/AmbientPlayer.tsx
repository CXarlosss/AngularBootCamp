import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { AmbientZone } from '../utils/audioService';

/**
 * Global component that handles ambient music transitions based on the current route.
 */
export function AmbientPlayer() {
  const location = useLocation();
  const { playAmbient } = useAudio();

  useEffect(() => {
    const path = location.pathname;
    let zone: AmbientZone = 'none';

    if (path === '/' || path === '/home' || path === '/player') {
      zone = 'home';
    } else if (path.includes('/play/relaxation')) {
      zone = 'relax';
    } else if (path.includes('/play/bravery')) {
      zone = 'relax'; // Bravery could have its own, but we reuse relax or add bravery synth later
    } else if (path === '/shop') {
      zone = 'shop';
    } else if (path === '/backpack' || path.includes('/album')) {
      zone = 'album';
    } else if (path === '/zen') {
      zone = 'zen';
    }

    playAmbient(zone);
  }, [location.pathname, playAmbient]);

  return null; // Invisible component
}
