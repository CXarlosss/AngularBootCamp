/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Config Store v2.0 — Optimizado para rendimiento
 * Zero re-renders innecesarios con useShallow
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useCallback, useEffect } from 'react';
import { hapticService } from '@/core/services/hapticService';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export interface AccessibilityConfig {
  reduceMotion: boolean;
  highContrast: boolean;
  hapticFeedback: boolean;
  largeText: boolean;
  highAccessibility: boolean;
  showTextLabels: boolean;
}

export interface PerformanceConfig {
  enablePrefetch: boolean;
  lowQualityMode: boolean;
  disableFilters: boolean;
  offlineCache: boolean;
}

export interface ConfigState {
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
  theme: 'light' | 'dark' | 'system';
  language: string;
  onboardingCompleted: boolean;
}

export interface ConfigActions {
  setAccessibility: (partial: Partial<AccessibilityConfig>) => void;
  setPerformance: (partial: Partial<PerformanceConfig>) => void;
  setTheme: (theme: ConfigState['theme']) => void;
  setLanguage: (lang: string) => void;
  completeOnboarding: () => void;
  resetToDefaults: () => void;
}

// ───────────────────────────────────────────────────────────────
// DEFAULTS
// ───────────────────────────────────────────────────────────────
const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  reduceMotion: false,
  highContrast: false,
  hapticFeedback: true,
  largeText: false,
  highAccessibility: false,
  showTextLabels: false,
};

const DEFAULT_PERFORMANCE: PerformanceConfig = {
  enablePrefetch: true,
  lowQualityMode: false,
  disableFilters: false,
  offlineCache: true,
};

const DEFAULT_STATE: Omit<ConfigState, keyof ConfigActions> = {
  accessibility: DEFAULT_ACCESSIBILITY,
  performance: DEFAULT_PERFORMANCE,
  theme: 'system',
  language: 'es',
  onboardingCompleted: false,
};

// ───────────────────────────────────────────────────────────────
// STORE
// ───────────────────────────────────────────────────────────────
export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      // ─── Actions ───
      setAccessibility: (partial) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...partial },
        })),

      setPerformance: (partial) =>
        set((state) => ({
          performance: { ...state.performance, ...partial },
        })),

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      resetToDefaults: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'way-plus-config',
      partialize: (state) => ({
        accessibility: state.accessibility,
        performance: state.performance,
        theme: state.theme,
        language: state.language,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);

// ───────────────────────────────────────────────────────────────
// OPTIMIZED SELECTORS — useShallow para objetos anidados
// Estos hooks solo re-renderizan cuando cambia la parte específica
// ───────────────────────────────────────────────────────────────

/** Hook estable: nunca causa re-render */
export function useConfigActions(): ConfigActions {
  return useConfigStore(
    useShallow((state) => ({
      setAccessibility: state.setAccessibility,
      setPerformance: state.setPerformance,
      setTheme: state.setTheme,
      setLanguage: state.setLanguage,
      completeOnboarding: state.completeOnboarding,
      resetToDefaults: state.resetToDefaults,
    }))
  );
}

/** Solo re-renderiza si cambia alguna propiedad de accessibility */
export function useAccessibilityConfig(): AccessibilityConfig {
  return useConfigStore(useShallow((state) => state.accessibility));
}

/** Solo re-renderiza si cambia alguna propiedad de performance */
export function usePerformanceConfig(): PerformanceConfig {
  return useConfigStore(useShallow((state) => state.performance));
}

/** Selectores atómicos — re-renderizan solo si cambia ese booleano específico */
export const useReduceMotion = () => useConfigStore((state) => state.accessibility.reduceMotion);
export const useHighContrast = () => useConfigStore((state) => state.accessibility.highContrast);
export const useHapticFeedback = () => useConfigStore((state) => state.accessibility.hapticFeedback);
export const useLargeText = () => useConfigStore((state) => state.accessibility.largeText);
export const useTheme = () => useConfigStore((state) => state.theme);
export const useLanguage = () => useConfigStore((state) => state.language);
export const useOnboardingCompleted = () => useConfigStore((state) => state.onboardingCompleted);

// ───────────────────────────────────────────────────────────────
// LEGACY COMPAT (si tienes componentes que usan el store directamente)
// ───────────────────────────────────────────────────────────────
export const useConfigStoreRaw = useConfigStore;

// ───────────────────────────────────────────────────────────────
// SYNC HOOK (para usar en App.tsx — reemplaza useAccessibilitySync anterior)
// ───────────────────────────────────────────────────────────────
export function useConfigSync() {
  const { reduceMotion, highContrast, hapticFeedback } = useAccessibilityConfig();
  const { setAccessibility } = useConfigActions();

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reduceMotion);
    document.body.classList.toggle('high-contrast', highContrast);
    hapticService.setConfig({
      enabled: hapticFeedback,
      respectReducedMotion: reduceMotion,
    });
  }, [reduceMotion, highContrast, hapticFeedback]);

  // Exponer para debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-ignore
      window.__WAY_CONFIG__ = {
        getState: useConfigStore.getState,
        setAccessibility,
      };
    }
  }, [setAccessibility]);
}
