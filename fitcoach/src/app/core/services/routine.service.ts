import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Routine, RoutineDay, Exercise } from '../models/routine.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private sb = supabase;

  async saveRoutine(routine: Routine): Promise<Routine> {
    // Guardamos rutina + días + ejercicios en transacción lógica
    const { error: rErr } = await this.sb.from('routines').upsert({
      id:          routine.id,
      name:        routine.name,
      goal:        routine.goal,
      coach_id:    routine.coachId,
      is_template: routine.isTemplate,
      created_at:  routine.createdAt.toISOString(),
    });
    if (rErr) throw rErr;

    for (const day of routine.days) {
      const { error: dErr } = await this.sb.from('routine_days').upsert({
        id:         day.id,
        routine_id: routine.id,
        day_number: day.dayNumber,
        label:      day.label,
      });
      if (dErr) throw dErr;

      for (const ex of day.exercises) {
        await this.sb.from('routine_exercises').upsert({
          id:            ex.id,
          day_id:        day.id,
          exercise_name: ex.name,
          sets:          ex.sets,
          reps:          ex.reps,
          target_weight: ex.targetWeight ?? null,
          rest_seconds:  ex.restSeconds,
          notes:         ex.notes ?? '',
        });
      }
    }
    return routine;
  }

  async assignToClients(routineId: string, clientIds: string[]): Promise<void> {
    const rows = clientIds.map(clientId => ({
      id:         crypto.randomUUID(),
      routine_id: routineId,
      client_id:  clientId,
      start_date: new Date().toISOString().split('T')[0],
      status:     'active',
    }));
    const { error } = await this.sb.from('assigned_routines').insert(rows);
    if (error) throw error;
  }

  async getCoachTemplates(coachId: string): Promise<Routine[]> {
    const { data, error } = await this.sb
      .from('routines')
      .select(`
        *,
        routine_days (
          *,
          routine_exercises (*)
        )
      `)
      .eq('coach_id', coachId)
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(this.mapRow);
  }

  private mapRow(row: any): Routine {
    return {
      id:          row.id,
      name:        row.name,
      goal:        row.goal,
      coachId:     row.coach_id,
      isTemplate:  row.is_template,
      createdAt:   new Date(row.created_at),
      days: (row.routine_days ?? [])
        .sort((a: any, b: any) => a.day_number - b.day_number)
        .map((d: any): RoutineDay => ({
          id:        d.id,
          dayNumber: d.day_number,
          label:     d.label,
          exercises: (d.routine_exercises ?? []).map((e: any): Exercise => ({
            id:           e.id,
            name:         e.exercise_name,
            sets:         e.sets,
            reps:         e.reps,
            targetWeight: e.target_weight ?? undefined,
            restSeconds:  e.rest_seconds,
            notes:        e.notes,
          })),
        })),
    };
  }
}
