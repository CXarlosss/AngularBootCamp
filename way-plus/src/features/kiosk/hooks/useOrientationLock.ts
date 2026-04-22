import { useEffect } from 'react';

export function useOrientationLock(orientation: 'portrait' | 'landscape' | 'natural', enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    
    const lock = async () => {
      try {
        if ('orientation' in screen && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock(orientation);
        }
      } catch (e) {
        console.warn('Orientation lock no soportado:', e);
      }
    };
    
    lock();
    
    return () => {
      if ('orientation' in screen && (screen.orientation as any).unlock) {
        try {
           (screen.orientation as any).unlock();
        } catch (e) {}
      }
    };
  }, [orientation, enabled]);
}
