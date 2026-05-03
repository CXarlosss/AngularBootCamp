import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { WorkoutLog, SetLog } from '../models/workout-log.model';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private sb = supabase;
  private auth = inject(AuthService);
  private notifSvc = inject(NotificationService);

  /**
   * Finaliza el entrenamiento: marca el día como completado y notifica al coach.
   */
  async finishWorkout(routineId: string, dayId: string, dayLabel: string): Promise<void> {
    console.log('[WorkoutService] finishWorkout INICIO');
    const userId = this.auth.user()?.id;
    if (!userId) {
      console.warn('[WorkoutService] finishWorkout: No hay userId');
      return;
    }

    // 1. Marcar día como completado
    console.log('[WorkoutService] Marcando día como completado...');
    await this.markDayCompleted(userId, routineId, dayId);

    // 2. Obtener nombre del cliente Y coach_id en una sola query
    console.log('[WorkoutService] Obteniendo coach_id...');
    const { data: clientProfile } = await this.sb
      .from('profiles')
      .select('full_name, coach_id')
      .eq('id', userId)
      .single();

    if (!clientProfile?.coach_id) {
      console.warn('[WorkoutService] finishWorkout: El cliente no tiene coach_id asignado');
      return;
    }

    // 3. Crear notificación para el coach
    console.log('[WorkoutService] Creando notificación para el coach:', clientProfile.coach_id);
    await this.notifSvc.create(
      clientProfile.coach_id,
      'workout_completed',
      `💪 ${clientProfile.full_name ?? 'Tu cliente'} ha entrenado`,
      `Ha completado: ${dayLabel}`,
      {
        client_id:  userId,
        routine_id: routineId,
        day_id:     dayId,
      }
    );
    console.log('[WorkoutService] finishWorkout FIN');
  }

  /**
   * Guarda el log detallado de ejercicios y series.
   */
  async saveWorkoutLog(log: WorkoutLog): Promise<void> {
    console.log('Guardando workout log:', log);
    
    const { error: wError } = await this.sb
      .from('workout_logs')
      .upsert({
        id: log.id,
        client_id: log.clientId,
        assigned_routine_id: log.assignedRoutineId,
        day_id: log.dayId,
        logged_date: log.loggedDate.toISOString().split('T')[0],
        completed: log.completed,
      }, { onConflict: 'id' });

    if (wError) throw wError;

    if (log.sets.length > 0) {
      const setsToInsert = log.sets.map(s => ({
        id: s.id,
        workout_log_id: log.id,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps_done: s.repsDone,
        completed_at: s.completedAt instanceof Date
          ? s.completedAt.toISOString()
          : s.completedAt ?? new Date().toISOString(),
      }));

      const { error: sError } = await this.sb.from('set_logs').insert(setsToInsert);
      if (sError) {
        console.error('[WorkoutService] set_logs error DETALLE:', JSON.stringify(sError));
        console.error('[WorkoutService] Primer set intentado:', JSON.stringify(setsToInsert[0]));
        throw sError;
      }
    }
  }

  async assignRoutineToClient(
    clientId: string,
    routineId: string,
    routineName: string
  ): Promise<void> {
    const { error } = await this.sb
      .from('assigned_routines')
      .insert({
        client_id:  clientId,
        routine_id: routineId,
        start_date: new Date().toISOString().split('T')[0],
        status:     'active',
      });

    if (error) {
      console.error('[WorkoutService] assignRoutine:', error.message);
      return;
    }

    await this.notifSvc.create(
      clientId,
      'routine_assigned',
      '📋 Nueva rutina asignada',
      `Tu entrenador te ha asignado: ${routineName}`,
      { routine_id: routineId }
    );
  }

  async markDayCompleted(clientId: string, routineId: string, dayId: string): Promise<void> {
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!dayId || !isUUID(dayId)) return;

    const { error } = await this.sb
      .from('completed_days')
      .upsert({
        client_id:    clientId,
        routine_id:   routineId,
        day_id:       dayId,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id,day_id',
        ignoreDuplicates: true,
      });

    if (error) console.error('[WorkoutService] Error en markDayCompleted:', error.message);
  }

  async getClientHistory(clientId: string): Promise<WorkoutLog[]> {
    const { data, error } = await this.sb
      .from('workout_logs')
      .select('*, sets:set_logs(*)')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(w => ({
      id: w.id,
      clientId: w.client_id,
      assignedRoutineId: w.assigned_routine_id,
      routineId: w.assigned_routine_id, 
      dayId: w.day_id,
      loggedDate: new Date(w.logged_date),
      completed: w.completed,
      sets: (w.sets || []).map((s: any) => ({
        id: s.id,
        exerciseId: s.exercise_id,
        exerciseName: s.exercise_name,
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        repsDone: s.reps_done,
        completedAt: new Date(s.completed_at)
      }))
    }));
  }

  async isDayCompleted(clientId: string, dayId: string): Promise<boolean> {
    const { data: completed } = await this.sb
      .from('completed_days')
      .select('id')
      .eq('client_id', clientId)
      .eq('day_id', dayId)
      .maybeSingle();

    if (completed) return true;

    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await this.sb
      .from('workout_logs')
      .select('id')
      .eq('client_id', clientId)
      .eq('day_id', dayId)
      .eq('logged_date', today)
      .eq('completed', true)
      .maybeSingle();
      
    return !!logs;
  }
}
