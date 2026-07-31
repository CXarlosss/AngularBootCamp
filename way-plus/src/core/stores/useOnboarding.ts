/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Onboarding Store — Flujo de primer uso del niño
 * Persiste progreso para que no se repita si cierra la app
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 'welcome' | 'character' | 'tutorial' | 'first-level' | 'completed';

export interface OnboardingState {
  step: OnboardingStep;
  selectedCharacter: string | null;
  tutorialCompleted: boolean;
  hasSeenWelcome: boolean;
}

export interface OnboardingActions {
  setStep: (step: OnboardingStep) => void;
  selectCharacter: (id: string) => void;
  completeTutorial: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      step: 'welcome',
      selectedCharacter: null,
      tutorialCompleted: false,
      hasSeenWelcome: false,

      setStep: (step) => set({ step, hasSeenWelcome: true }),
      selectCharacter: (id) => set({ selectedCharacter: id }),
      completeTutorial: () => set({ tutorialCompleted: true, step: 'first-level' }),
      skipOnboarding: () => set({ step: 'completed', tutorialCompleted: true }),
      resetOnboarding: () =>
        set({
          step: 'welcome',
          selectedCharacter: null,
          tutorialCompleted: false,
          hasSeenWelcome: false,
        }),
    }),
    {
      name: 'way-onboarding',
    }
  )
);
