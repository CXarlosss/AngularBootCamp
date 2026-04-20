import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { ExerciseProgress, ExerciseDataPoint } from '../../state/progress.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private sb = supabase;

  async getExerciseProgress(clientId: string): Promise<ExerciseProgress[]> {
    // Traemos todos los set_logs del cliente con fecha
    const { data, error } = await this.sb
      .from('set_logs')
      .select(`
        weight_kg, reps_done, exercise_name,
        workout_logs!inner ( logged_date, client_id )
      `)
      .eq('workout_logs.client_id', clientId)
      .order('workout_logs(logged_date)', { ascending: true });

    if (error) {
      console.error('ProgressService: Error al cargar progreso:', error);
      throw error;
    }

    console.log('ProgressService: Datos crudos recibidos:', data?.length, 'filas');

    // Agrupar por ejercicio y por fecha, calcular max y volumen
    const map = new Map<string, Map<string, { maxW: number; vol: number }>>();

    for (const row of data ?? []) {
      const name = row.exercise_name;
      
      // Extraer fecha de forma robusta (maneja objeto o array por join)
      let dateValue = '';
      if (row.workout_logs) {
        if (Array.isArray(row.workout_logs)) {
          dateValue = row.workout_logs[0]?.logged_date;
        } else {
          dateValue = (row.workout_logs as any).logged_date;
        }
      }

      if (!dateValue || !name) continue;

      if (!map.has(name)) map.set(name, new Map());
      const byDate = map.get(name)!;
      const prev   = byDate.get(dateValue) ?? { maxW: 0, vol: 0 };
      
      byDate.set(dateValue, {
        maxW: Math.max(prev.maxW, row.weight_kg),
        vol:  prev.vol + (row.weight_kg * row.reps_done),
      });
    }

    const results = [...map.entries()].map(([name, byDate]) => ({
      name,
      dataPoints: [...byDate.entries()].map(([date, v]): ExerciseDataPoint => ({
        date:      new Date(date),
        maxWeight: v.maxW,
        totalVol:  v.vol,
      })),
    }));

    console.log('ProgressService: Progreso procesado:', results);
    return results;
  }

  async getWeeklyAdherence(clientId: string): Promise<number[]> {
    // Últimas 8 semanas: % de días con log vs días con rutina asignada
    const { data } = await this.sb
      .from('workout_logs')
      .select('logged_date, completed')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: false })
      .limit(56); // 8 semanas × 7 días

    const weeks: number[] = Array(8).fill(0);
    const now = new Date();

    for (const row of data ?? []) {
      const daysAgo = Math.floor(
        (now.getTime() - new Date(row.logged_date).getTime()) / 86400000
      );
      const weekIdx = Math.floor(daysAgo / 7);
      if (weekIdx < 8 && row.completed) weeks[weekIdx]++;
    }
    // Normalizar a porcentaje (máx 7 días por semana)
    return weeks.map(n => Math.min(100, Math.round((n / 4) * 100)));
  }

  async getProgressPhotos(clientId: string): Promise<any[]> {
    const { data } = await this.sb
      .from('progress_photos')
      .select('id, storage_path, taken_date')
      .eq('client_id', clientId)
      .order('taken_date', { ascending: false });

    return (data ?? []).map(row => {
      const { data: urlData } = this.sb.storage
        .from('progress-photos')
        .getPublicUrl(row.storage_path);
      return {
        id: row.id,
        url: urlData.publicUrl,
        takenAt: new Date(row.taken_date)
      };
    });
  }

  async uploadPhoto(clientId: string, file: File): Promise<any> {
    const path = `${clientId}/${Date.now()}-${file.name}`;
    const { error } = await this.sb.storage
      .from('progress-photos')
      .upload(path, file, { contentType: file.type });
    if (error) throw error;

    const { data: inserted } = await this.sb.from('progress_photos').insert({
      client_id:    clientId,
      storage_path: path,
      taken_date:   new Date().toISOString().split('T')[0],
    }).select().single();

    const { data: urlData } = this.sb.storage
      .from('progress-photos')
      .getPublicUrl(path);

    return {
      id: inserted?.id ?? Date.now().toString(),
      url: urlData.publicUrl,
      takenAt: new Date()
    };
  }
}
