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
  async finishWorkout(
    routineId: string,
    dayId: string,
    dayLabel: string,
  ): Promise<void> {
    console.log('[WorkoutService] finishWorkout INICIO');
    const userId = this.auth.user()?.id;
    if (!userId) {
      console.warn('[WorkoutService] finishWorkout: No hay userId');
      return;
    }

    // 1. Marcar día como completado (Atómico)
    console.log('[WorkoutService] Marcando día como completado...');
    const wasInserted = await this.markDayCompleted(userId, routineId, dayId);

    if (!wasInserted) {
      console.warn('[WorkoutService] Carrera detectada: El día ya ha sido completado por otro dispositivo.');
      throw new Error('DAY_ALREADY_COMPLETED'); // Lanzamos para abortar notificaciones/XP
    }

    // 2. Obtener nombre del cliente Y coach_id en una sola query
    // ... resto del método sigue igual ...
    console.log('[WorkoutService] Obteniendo coach_id...');
    const { data: clientProfile } = await this.sb
      .from('profiles')
      .select('full_name, coach_id')
      .eq('id', userId)
      .single();

    if (!clientProfile?.coach_id) {
      console.warn(
        '[WorkoutService] finishWorkout: El cliente no tiene coach_id asignado',
      );
      return;
    }

    // 3. Crear notificación para el coach
    console.log(
      '[WorkoutService] Creando notificación para el coach:',
      clientProfile.coach_id,
    );
    await this.notifSvc.create(
      clientProfile.coach_id,
      'workout_completed',
      `💪 ${clientProfile.full_name ?? 'Tu cliente'} ha entrenado`,
      `Ha completado: ${dayLabel}`,
      {
        client_id: userId,
        routine_id: routineId,
        day_id: dayId,
      },
    );
    console.log('[WorkoutService] finishWorkout FIN');
  }

  /**
   * Guarda el log detallado de ejercicios y series.
   */
  async saveWorkoutLog(log: WorkoutLog): Promise<void> {
    console.log('Guardando workout log:', log);

    const { error: wError } = await this.sb.from('workout_logs').upsert(
      {
        id: log.id,
        client_id: log.clientId,
        assigned_routine_id: log.assignedRoutineId,
        day_id: log.dayId,
        logged_date:
          log.loggedDate instanceof Date
            ? log.loggedDate.toISOString().split('T')[0]
            : typeof log.loggedDate === 'string'
              ? (log.loggedDate as any).split('T')[0]
              : new Date().toISOString().split('T')[0],
        completed: log.completed,
      },
      { onConflict: 'id' },
    );

    // ← NO hacer throw — dejar que el flujo continúe
    if (wError) {
      console.error('[WorkoutService] workout_logs error:', wError.message);
      return; // salir pero NO lanzar excepción
    }

    if (log.sets.length > 0) {
      const setsToInsert = log.sets.map((s) => ({
        id: s.id,
        workout_log_id: log.id,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps_done: s.repsDone,
        completed_at:
          s.completedAt instanceof Date
            ? s.completedAt.toISOString()
            : ((s.completedAt as any) ?? new Date().toISOString()),
      }));

      const { error: sError } = await this.sb
        .from('set_logs')
        .insert(setsToInsert);

      if (sError) {
        // ← Log del error pero NO throw — continuar con XP y completed_days
        console.error('[WorkoutService] set_logs error:', sError.message);
        console.error(
          '[WorkoutService] Primer set:',
          JSON.stringify(setsToInsert[0]),
        );
      }
    }
  }

  async assignRoutineToClient(
    clientId: string,
    routineId: string,
    routineName: string,
  ): Promise<void> {
    const { error } = await this.sb.from('assigned_routines').insert({
      client_id: clientId,
      routine_id: routineId,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
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
      { routine_id: routineId },
    );
  }

  async markDayCompleted(
    clientId: string,
    routineId: string,
    dayId: string,
  ): Promise<boolean> {
    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        str,
      );
    if (!dayId || !isUUID(dayId)) return false;

    const { data, error } = await this.sb.from('completed_days').upsert(
      {
        client_id: clientId,
        routine_id: routineId,
        day_id: dayId,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'client_id,day_id',
        ignoreDuplicates: true,
      },
    ).select();

    if (error) {
      console.error(
        '[WorkoutService] Error en markDayCompleted:',
        error.message,
      );
      return false;
    }

    return (data && data.length > 0);
  }

  async getClientHistory(clientId: string): Promise<WorkoutLog[]> {
    const { data, error } = await this.sb
      .from('workout_logs')
      .select('*, sets:set_logs(*)')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((w) => ({
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
        completedAt: new Date(s.completed_at),
      })),
    }));
  }

  async isDayCompleted(clientId: string, dayId: string): Promise<boolean> {
    // 1. Verificación atómica vía RPC (más rápida y segura)
    const { data: isBlocked, error: rpcError } = await this.sb.rpc('is_day_blocked', {
      p_client_id: clientId,
      p_day_id: dayId
    });

    if (!rpcError && isBlocked) return true;

    // 2. Fallback a tablas manuales por si el RPC falla o no está propagado
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
