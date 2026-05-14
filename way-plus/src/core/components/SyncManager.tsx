// src/core/components/SyncManager.tsx
import { useEffect } from 'react';
import { syncEngine } from '@/core/sync/SyncEngine';

/**
 * SyncManager
 * Thin React wrapper to lifecycle-manage the SyncEngine.
 */
export function SyncManager() {
  useEffect(() => {
    // Iniciamos el motor fuera de React
    syncEngine.start();

    // Limpieza al desmontar (evita fugas en HMR o cambios de layout)
    return () => {
      syncEngine.stop(); 
    };
  }, []);

  return null;
}
