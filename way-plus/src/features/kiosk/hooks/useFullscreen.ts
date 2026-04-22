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

    enterFullscreen();
    
    const handleInteraction = () => {
      if (!document.fullscreenElement) enterFullscreen();
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    const handleChange = () => {
      if (!document.fullscreenElement && enabled) {
        setTimeout(enterFullscreen, 300);
      }
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
