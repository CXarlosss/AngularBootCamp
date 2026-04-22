import { useEffect, useCallback, useRef } from 'react';

export function useFullscreen(enabled: boolean) {
  const elementRef = useRef<HTMLElement | null>(null);

  const enterFullscreen = useCallback(async () => {
    const el = elementRef.current || document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen();
    } catch (e) {
      console.warn('Fullscreen no permitido:', e);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!enabled) {
      exitFullscreen();
      return;
    }

    // Do NOT call enterFullscreen() here on mount. 
    // Browsers strictly require a user gesture (click/touch).
    
    const handleInteraction = () => {
      // Only request fullscreen if we aren't already and it's enabled
      if (!document.fullscreenElement && enabled) {
        enterFullscreen();
      }
    };

    // Use passive true where possible, but here we just listen to clicks
    document.addEventListener('click', handleInteraction, { capture: true });
    document.addEventListener('touchstart', handleInteraction, { capture: true, passive: true });
    
    const handleChange = () => {
      // If the user manually exited fullscreen, we shouldn't force them back instantly 
      // without a gesture. We wait for their next click.
    };
    
    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, [enabled, enterFullscreen, exitFullscreen]);

  return { elementRef, enterFullscreen, exitFullscreen };
}
