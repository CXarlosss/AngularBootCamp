import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { AssignedRoutine, Routine, RoutineDay, Exercise } from '../models/routine.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientRoutineService {
  private sb = supabase;

  async getActiveRoutine(clientId: string): Promise<AssignedRoutine | null> {
    if (!clientId) return null;

    console.log('Buscando rutina para clientId:', clientId);

    const { data, error } = await this.sb
      .from('assigned_routines')
      .select(`
        id, client_id, start_date, status,
        routines (
          id, name, goal, coach_id, is_template, created_at,
          routine_days (
            id, day_number, label,
            routine_exercises (
              id, exercise_name, sets, reps,
              target_weight, rest_seconds, notes
            )
          )
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Data:', data, 'Error:', error);

    if (error || !data) return null;
    if (!data.routines) return null;

    const r = data.routines as any;
    const routine: Routine = {
      id:         r.id,
      name:       r.name,
      goal:       r.goal,
      coachId:    r.coach_id,
      isTemplate: r.is_template,
      createdAt:  new Date(r.created_at),
      days: (r.routine_days ?? [])
        .sort((a: any, b: any) => a.day_number - b.day_number)
        .map((d: any): RoutineDay => ({
          id:        d.id,
          dayNumber: d.day_number,
          label:     d.label,
          exercises: (d.routine_exercises ?? []).map((e: any): Exercise => ({
            id:           e.id,
            name:         e.exercise_name,
            sets:          e.sets,
            reps:          e.reps,
            targetWeight:  e.target_weight ?? undefined,
            restSeconds:   e.rest_seconds,
            notes:         e.notes ?? '',
          })),
        })),
    };

    return {
      id:        data.id,
      clientId:  data.client_id,
      routineId: routine.id,
      routine,
      startDate: new Date(data.start_date),
      status:    data.status as any,
    };
  }
}
