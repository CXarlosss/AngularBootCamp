import { Injectable, inject } from '@angular/core';
import { supabase } from '../../../../core/supabase.client';
import { AuthService } from '../../../../core/auth/auth.service';

export interface WeightEntry {
  id?: string;
  weight_kg: number;
  recorded_at: string;
  notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WeightLogService {
  private sb   = supabase;
  private auth = inject(AuthService);

  // Draft state para mantener el formulario si cambias de pestaña
  draftWeight: number | null = null;
  draftNote: string = '';

  clearDraft() {
    this.draftWeight = null;
    this.draftNote = '';
  }

  async logWeight(weight_kg: number, notes?: string): Promise<void> {
    const userId = this.auth.profile()?.id;
    if (!userId) throw new Error('No autenticado');

    // Verificar si ya hay registro hoy
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: existing } = await this.sb
      .from('weight_logs')
      .select('id')
      .eq('client_id', userId)
      .gte('recorded_at', todayStart.toISOString())
      .maybeSingle();

    if (existing) {
      // Actualizar el de hoy en lugar de duplicar
      await this.sb
        .from('weight_logs')
        .update({ weight_kg, notes: notes || null })
        .eq('id', existing.id);
    } else {
      await this.sb
        .from('weight_logs')
        .insert({
          client_id: userId,
          weight_kg,
          notes: notes || null,
          recorded_at: new Date().toISOString(),
        });
    }
  }

  async getHistory(limit = 30): Promise<WeightEntry[]> {
    const userId = this.auth.profile()?.id;
    if (!userId) return [];

    const { data, error } = await this.sb
      .from('weight_logs')
      .select('id, weight_kg, recorded_at, notes')
      .eq('client_id', userId)
      .order('recorded_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('WeightLogService.getHistory:', error.message);
      return [];
    }
    return data ?? [];
  }

  async getLastEntry(): Promise<WeightEntry | null> {
    const userId = this.auth.profile()?.id;
    if (!userId) return null;

    const { data } = await this.sb
      .from('weight_logs')
      .select('id, weight_kg, recorded_at, notes')
      .eq('client_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ?? null;
  }

  daysSinceLastEntry(lastEntry: WeightEntry | null): number {
    if (!lastEntry) return Infinity;
    const ms = Date.now() - new Date(lastEntry.recorded_at).getTime();
    return Math.floor(ms / 86400000);
  }
}
