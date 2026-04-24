import React, { useEffect } from 'react';
import { useKioskStore } from '../store/kioskStore';
import { useFullscreen } from '../hooks/useFullscreen';
import { useWakeLock } from '../hooks/useWakeLock';
import { useOrientationLock } from '../hooks/useOrientationLock';
import { useGestureBlocker } from '../hooks/useGestureBlocker';
import { ExitPinModal } from './ExitPinModal';

interface KioskGateProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * KioskGate protects the app from being exited by patients.
 * Standard function declaration for maximum compatibility.
 */
export function KioskGate({ children, enabled = true }: KioskGateProps) {
  const isLocked = useKioskStore(s => s.isLocked);
  const lock = useKioskStore(s => s.lock);
  
  // Dev bypass
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.search.includes('dev=true')
  );
  
  // Only activate on touch devices in production/lock mode
  const isTouchDevice = typeof window !== 'undefined' && (
    ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0)
  );
  
  const active = enabled && isLocked && isTouchDevice && !isDev;

  // System locks
  useFullscreen(active);
  useWakeLock(active);
  useOrientationLock('landscape', active);
  useGestureBlocker(active);

  useEffect(() => {
    if (enabled && !isLocked) {
      lock();
    }
  }, [enabled, isLocked, lock]);

  return (
    <div className="relative w-full min-h-screen">
      {children}
      <ExitPinModal />
    </div>
  );
}
