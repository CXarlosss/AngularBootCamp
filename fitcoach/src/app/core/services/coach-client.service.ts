import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { from, map, Observable } from 'rxjs';

export interface ClientSnapshot {
  profile: {
    id: string;
    full_name: string;
    rank: number;
    xp: number;
    target_weight?: number;
    last_active?: string;
  };
  adherence: {
    week: string;
    planned: number;
    completed: number;
    rate: number;
  }[];
  recent_prs: {
    exercise: string;
    weight: number;
    date: string;
  }[];
  volume_trend: {
    week: string;
    total_volume: number;
  }[];
  weight_logs: {
    date: string;
    weight: number;
    delta?: number;
  }[];
  last_workout: {
    date: string;
    day_name: string;
    completed: boolean;
  } | null;
  photos_index?: {
    id: string;
    storage_path: string;
    created_at: string;
    file_size_kb: number;
    thumbnail_path: string | null;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CoachClientService {
  private sb = supabase;

  /**
   * Obtiene un snapshot completo del progreso del cliente utilizando
   * el RPC optimizado en base de datos.
   * La validación de que el cliente pertenece al coach se hace a nivel de BBDD.
   */
  getClientProgressSnapshot(clientId: string): Observable<ClientSnapshot | null> {
    return from(
      this.sb.rpc('get_client_progress_snapshot', {
        target_client_id: clientId
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('[CoachClientService] Error fetching snapshot:', error);
          return null;
        }
        return data as ClientSnapshot | null;
      })
    );
  }
}
