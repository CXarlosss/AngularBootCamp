import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export type ThemePreference = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private sb = inject(SupabaseService).client;
  private auth = inject(AuthService);

  private currentPreference = signal<ThemePreference>('system');
  preference = this.currentPreference.asReadonly();

  constructor() {
    // Listen to changes and apply theme
    effect(() => {
      this.applyTheme(this.currentPreference());
    });

    // Watch OS preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentPreference() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  async loadPreference(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;

    try {
      const { data } = await this.sb
        .from('profiles')
        .select('theme_preference')
        .eq('id', user.id)
        .single();

      if (data?.theme_preference) {
        this.currentPreference.set(data.theme_preference as ThemePreference);
      }
    } catch (e) {
      console.warn('Could not load theme preference', e);
    }
  }

  async setPreference(pref: ThemePreference): Promise<void> {
    this.currentPreference.set(pref);
    
    const user = this.auth.user();
    if (!user) return;

    try {
      await this.sb
        .from('profiles')
        .update({ theme_preference: pref })
        .eq('id', user.id);
    } catch (e) {
      console.error('Error saving theme preference', e);
    }
  }

  private applyTheme(pref: ThemePreference): void {
    let activeMode: 'light' | 'dark' = 'dark';
    
    if (pref === 'system') {
      activeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      activeMode = pref;
    }

    if (activeMode === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }
}
