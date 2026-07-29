import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  accessibility: {
    reduceMotion: boolean;
    highAccessibility: boolean; // Simpler icons, larger hitboxes
    contrastMode: boolean;
    showTextLabels: boolean;
    hapticFeedback: boolean;
  };
  performance: {
    lowResAssets: boolean;
    disableFilters: boolean; // Disable backdrop-filter and complex shadows
  };
  
  // Actions
  setReduceMotion: (value: boolean) => void;
  setHighAccessibility: (value: boolean) => void;
  setContrastMode: (value: boolean) => void;
  setShowTextLabels: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setPerformanceMode: (value: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      accessibility: {
        reduceMotion: false,
        highAccessibility: false,
        contrastMode: false,
        showTextLabels: true,
        hapticFeedback: true,
      },
      performance: {
        lowResAssets: false,
        disableFilters: false,
      },

      setReduceMotion: (value) => 
        set((state) => ({ accessibility: { ...state.accessibility, reduceMotion: value } })),
      setHighAccessibility: (value) => 
        set((state) => ({ accessibility: { ...state.accessibility, highAccessibility: value } })),
      setContrastMode: (value) => 
        set((state) => ({ accessibility: { ...state.accessibility, contrastMode: value } })),
      setShowTextLabels: (value) => 
        set((state) => ({ accessibility: { ...state.accessibility, showTextLabels: value } })),
      setHapticFeedback: (value) => 
        set((state) => ({ accessibility: { ...state.accessibility, hapticFeedback: value } })),
      setPerformanceMode: (value) => 
        set((state) => ({ performance: { ...state.performance, disableFilters: value } })),
    }),
    {
      name: 'way-config-storage',
      storage: {
        getItem: (name) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'demo-1';
          const str = sessionStorage.getItem(`${name}-${patientId}`);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'demo-1';
          sessionStorage.setItem(`${name}-${patientId}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'demo-1';
          sessionStorage.removeItem(`${name}-${patientId}`);
        }
      }
    }
  )
);

