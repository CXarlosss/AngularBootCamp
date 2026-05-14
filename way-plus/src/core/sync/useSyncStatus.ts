import { useState, useEffect } from 'react';
import { syncEngine, type SyncState } from './SyncEngine';

/**
 * Hook que expone el estado del SyncEngine a los componentes de Maite.
 *
 * Uso en el dashboard:
 *   const { status, lastSyncAt, minutesSinceSync, circuitPausedUntil } = useSyncStatus();
 */
export function useSyncStatus() {
  const [state, setState] = useState<SyncState>(syncEngine.getStatus());

  useEffect(() => {
    const unsub = syncEngine.onStatusChange(setState);
    return unsub;
  }, []);

  const minutesSinceSync = state.lastSyncAt
    ? Math.floor((Date.now() - state.lastSyncAt) / 60_000)
    : null;

  const secondsUntilReset = state.circuitPausedUntil
    ? Math.max(0, Math.ceil((state.circuitPausedUntil - Date.now()) / 1000))
    : null;

  return {
    ...state,
    minutesSinceSync,
    secondsUntilReset,
    isHealthy: state.status === 'idle' || state.status === 'pushing' || state.status === 'pulling',
  };
}
