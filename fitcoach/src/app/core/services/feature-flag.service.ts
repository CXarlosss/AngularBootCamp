import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase.client';

interface FeatureConfig {
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  allowedUsers?: string[]; // UUIDs para testing interno
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal<Record<string, FeatureConfig>>({});
  private supabase = supabase;
  
  constructor() {
    this.loadCachedFlags();
    this.loadFlags();
  }

  private loadCachedFlags(): void {
    const cached = localStorage.getItem('fitcoach_feature_flags');
    if (cached) {
      try {
        this.flags.set(JSON.parse(cached));
      } catch (e) {
        console.error('Error parsing cached flags', e);
      }
    }
  }

  async loadFlags(): Promise<void> {
    // Cargar desde Supabase o config estática inicial
    const { data } = await this.supabase
      .from('feature_flags')
      .select('*');
    
    const config: Record<string, FeatureConfig> = {};
    for (const row of data || []) {
      config[row.name] = {
        enabled: row.enabled,
        rolloutPercentage: row.rollout_percentage,
        allowedUsers: row.allowed_users
      };
    }
    
    this.flags.set(config);
    localStorage.setItem('fitcoach_feature_flags', JSON.stringify(config));
  }

  /**
   * Verificar si un feature está activo para el usuario actual
   */
  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags()[flagName];
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    // Usuarios permitidos explícitamente (testing)
    if (userId && flag.allowedUsers?.includes(userId)) return true;
    
    // Rollout porcentual basado en hash del userId
    if (userId) {
      const hash = this.hashString(userId + flagName);
      const percentage = (hash % 100);
      return percentage < flag.rolloutPercentage;
    }
    
    return flag.rolloutPercentage >= 100;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
