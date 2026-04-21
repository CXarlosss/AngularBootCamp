import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { WorkoutLog, SetLog } from '../models/workout-log.model';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private sb = supabase;

  async saveWorkoutLog(log: WorkoutLog): Promise<void> {
    console.log('WorkoutService: Guardando log de entrenamiento...', log.id);
    
    // 1. Insertar la cabecera
    const { error: wError } = await this.sb.from('workout_logs').insert({
      id: log.id,
      client_id: log.clientId,
      assigned_routine_id: log.assignedRoutineId,
      day_id: log.dayId,
      logged_date: log.loggedDate,
      completed: log.completed
    });

    if (wError) {
      console.error('Error al guardar workout_log:', wError);
      throw wError;
    }

    // 2. Insertar series si existen
    if (log.sets.length > 0) {
      const setsToInsert = log.sets.map(s => ({
        workout_log_id: log.id,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps_done: s.repsDone
      }));

      const { error: sError } = await this.sb.from('set_logs').insert(setsToInsert);
      if (sError) {
        console.error('Error al guardar set_logs:', sError);
        throw sError;
      }
    }
    console.log('WorkoutService: Entrenamiento guardado con éxito');
  }

  async getClientHistory(clientId: string): Promise<WorkoutLog[]> {
    const { data, error } = await this.sb
      .from('workout_logs')
      .select(`
        *,
        sets:set_logs(*)
      `)
      .eq('client_id', clientId)
      .order('logged_date', { ascending: false });

    if (error) {
      console.error('Error al cargar historial:', error);
      throw error;
    }
    
    // Mapear snake_case a camelCase para la interfaz frontend
    return (data || []).map(w => ({
      id: w.id,
      clientId: w.client_id,
      assignedRoutineId: w.assigned_routine_id,
      dayId: w.day_id,
      loggedDate: new Date(w.logged_date),
      completed: w.completed,
      sets: (w.sets || []).map((s: any) => ({
        id: s.id,
        exerciseId: s.exercise_id,
        exerciseName: s.exercise_name,
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        repsDone: s.reps_done
      }))
    }));
  }
}
