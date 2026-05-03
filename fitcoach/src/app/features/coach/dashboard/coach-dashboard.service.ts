import { Injectable, inject } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { Profile } from '../../../core/models/profile.model';

@Injectable({ providedIn: 'root' })
export class CoachDashboardService {
  private sb = supabase;

  async getClients(coachId: string): Promise<any[]> {
    // 1. Cargar perfiles de clientes
    const { data: clients, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('coach_id', coachId);

    if (error || !clients) return [];

    const clientIds = clients.map(c => c.id);
    if (clientIds.length === 0) return [];

    // 2. Cargar último entrenamiento y adherencia (simplificado para el dashboard)
    const { data: lastWorkouts } = await this.sb
      .from('workout_logs')
      .select('client_id, logged_date, completed')
      .in('client_id', clientIds)
      .order('logged_date', { ascending: false });

    const lastByClient = new Map<string, any>();
    const adherenceByClient = new Map<string, number>();

    // Calcular adherencia básica (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

    for (const w of lastWorkouts ?? []) {
      if (!lastByClient.has(w.client_id)) {
        lastByClient.set(w.client_id, w.logged_date);
      }
      
      if (w.logged_date >= thirtyDaysStr && w.completed) {
        adherenceByClient.set(w.client_id, (adherenceByClient.get(w.client_id) ?? 0) + 1);
      }
    }

    // 3. Cruzar datos
    return clients.map(c => {
      const last = lastByClient.get(c.id);
      const count = adherenceByClient.get(c.id) ?? 0;
      // Asumimos 3 entrenamientos/semana = 12 al mes para el %
      const adherence = Math.min(100, Math.round((count / 12) * 100));
      
      const days = last
        ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000)
        : 99;

      return {
        ...c,
        name: c.full_name,
        lastWorkout: last,
        adherence,
        activeToday: days === 0,
        daysAgo: days
      };
    });
  }
}
