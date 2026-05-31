import { Injectable, signal } from '@angular/core';

export type OnboardingStep = 'welcome' | 'quickButtons' | 'firstMission';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly STORAGE_KEY = 'fitcoach_onboarding_client_v1';
  
  private state = signal<Record<OnboardingStep, boolean>>(this.loadState());
  
  private loadState(): Record<OnboardingStep, boolean> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* corrupt data */ }
    return { welcome: false, quickButtons: false, firstMission: false };
  }
  
  private saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
  }
  
  isStepComplete(step: OnboardingStep): boolean {
    return this.state()[step];
  }
  
  markComplete(step: OnboardingStep) {
    this.state.update(s => ({ ...s, [step]: true }));
    this.saveState();
  }
  
  dismissAll() {
    this.state.set({ welcome: true, quickButtons: true, firstMission: true });
    this.saveState();
  }
  
  shouldShowAny(): boolean {
    return Object.values(this.state()).some(v => !v);
  }
}
