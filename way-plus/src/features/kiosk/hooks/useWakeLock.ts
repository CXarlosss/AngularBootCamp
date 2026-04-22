import { useEffect, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      wakeLockRef.current?.release().catch(() => {});
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (e) {
        console.warn('Wake Lock no soportado:', e);
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, [enabled]);
}
