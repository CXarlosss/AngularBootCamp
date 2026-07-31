/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useOptimisticAction — Acciones optimistas con rollback
 * Feedback instantáneo + haptics + recuperación de errores
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { hapticService } from '@/core/services/hapticService';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export type OptimisticStatus = 'idle' | 'pending' | 'success' | 'error';

export interface OptimisticState<T> {
  status: OptimisticStatus;
  data: T | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface OptimisticOptions<T> {
  /** Datos que mostrar inmediatamente antes de confirmar */
  optimisticData?: T;
  /** Haptic al iniciar (default: 'click') */
  hapticOnStart?: 'click' | 'success' | 'celebration' | 'milestone' | 'none';
  /** Haptic al éxito (default: 'success') */
  hapticOnSuccess?: 'success' | 'celebration' | 'milestone' | 'none';
  /** Haptic al error (default: 'error') */
  hapticOnError?: 'error' | 'none';
  /** Delay mínimo para mostrar pending (evita flash en conexiones rápidas) */
  minPendingMs?: number;
  /** Callback cuando la acción real confirma éxito */
  onSuccess?: (data: T) => void;
  /** Callback cuando falla (después del rollback) */
  onError?: (error: Error, rolledBackData: T | null) => void;
}

export interface OptimisticActions<T> {
  execute: (asyncAction: () => Promise<T>, options?: OptimisticOptions<T>) => Promise<void>;
  reset: () => void;
  setOptimistic: (data: T) => void;
}

// ───────────────────────────────────────────────────────────────
// HOOK
// ───────────────────────────────────────────────────────────────
export function useOptimisticAction<T = unknown>(): OptimisticState<T> & OptimisticActions<T> {
  const [status, setStatus] = useState<OptimisticStatus>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Guardamos el estado anterior para rollback
  const previousDataRef = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setData(null);
    setError(null);
    previousDataRef.current = null;
  }, []);

  const setOptimistic = useCallback((optimisticData: T) => {
    previousDataRef.current = data;
    setData(optimisticData);
    setStatus('pending');
    setError(null);
  }, [data]);

  const execute = useCallback(
    async (
      asyncAction: () => Promise<T>,
      options: OptimisticOptions<T> = {}
    ): Promise<void> => {
      const {
        optimisticData,
        hapticOnStart = 'click',
        hapticOnSuccess = 'success',
        hapticOnError = 'error',
        minPendingMs = 300,
        onSuccess,
        onError,
      } = options;

      // Cancelar operación anterior si existe
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // 1. Feedback inmediato (primer frame)
      if (hapticOnStart !== 'none') {
        // @ts-ignore
        hapticService[hapticOnStart]();
      }

      // 2. Guardar estado previo y aplicar optimista
      previousDataRef.current = data;
      if (optimisticData !== undefined) {
        setData(optimisticData);
      }
      setStatus('pending');
      setError(null);

      // 3. Delay mínimo para evitar flash de "pending" en conexiones rápidas
      const pendingStartTime = Date.now();

      try {
        const result = await asyncAction();
        const elapsed = Date.now() - pendingStartTime;

        // Asegurar que el pending dure al menos minPendingMs para que el usuario lo perciba
        if (elapsed < minPendingMs) {
          await new Promise((r) => {
            timeoutRef.current = setTimeout(r, minPendingMs - elapsed);
          });
        }

        // 4. Éxito confirmado
        setData(result);
        setStatus('success');
        if (hapticOnSuccess !== 'none') {
          // @ts-ignore
          hapticService[hapticOnSuccess]();
        }
        onSuccess?.(result);
      } catch (err) {
        // 5. Rollback + error
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setData(previousDataRef.current);
        setError(errorObj);
        setStatus('error');

        if (hapticOnError !== 'none') {
          // @ts-ignore
          hapticService[hapticOnError]();
        }
        onError?.(errorObj, previousDataRef.current);
      }
    },
    [data]
  );

  return {
    status,
    data,
    error,
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    execute,
    reset,
    setOptimistic,
  };
}

// ───────────────────────────────────────────────────────────────
// VARIANTE ESPECÍFICA PARA GAMIFICACIÓN (reclamar, completar, etc.)
// ───────────────────────────────────────────────────────────────
export interface GamifiedActionOptions<T> extends OptimisticOptions<T> {
  rewardType?: 'star' | 'coin' | 'chest' | 'milestone';
}

export function useGamifiedAction<T = unknown>() {
  const optimistic = useOptimisticAction<T>();

  const claim = useCallback(
    async (
      asyncAction: () => Promise<T>,
      options: GamifiedActionOptions<T> = {}
    ) => {
      const { rewardType = 'star', ...rest } = options;

      return optimistic.execute(asyncAction, {
        hapticOnStart: 'click',
        hapticOnSuccess: rewardType === 'milestone' ? 'milestone' : 'celebration',
        hapticOnError: 'error',
        minPendingMs: 400, // Las animaciones de cofre/recompensa necesitan tiempo
        ...rest,
      });
    },
    [optimistic]
  );

  return { ...optimistic, claim };
}
