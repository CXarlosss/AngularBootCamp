/**
 * patientService.ts
 * Capa de datos para la tabla `patients`.
 * El ID canónico de un paciente es SIEMPRE el UUID de patients.id.
 *
 * Flujo correcto:
 *   1. Maite crea paciente → insert en patients → recibe UUID
 *   2. UUID se guarda en TherapistStore como patient.id
 *   3. Todos los servicios (sessionService, syncService) usan ese UUID
 */

import { supabase, isSupabaseAvailable } from './supabaseClient';
import type { Patient } from '@/features/therapist/store/therapistStore';

export interface SupabasePatient {
  id: string;           // UUID
  therapist_id: string; // UUID — por ahora hardcoded hasta que haya auth
  name: string;
  age: number;
  avatar_emoji: string;
  current_level: string;
  diagnosis: string | null;
  player_pin?: string;
  created_at: string;
}

async function getCurrentTherapistId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Fallback local cuando Supabase no está disponible
const LOCAL_KEY = 'way_patients_local';

function getLocalPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPatients(patients: Patient[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(patients));
}

function supabaseToStore(p: SupabasePatient): Patient {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    avatar: p.avatar_emoji,
    diagnosis: p.diagnosis ?? undefined,
    currentLevel: p.current_level,
    startDate: p.created_at.split('T')[0],
    lastSession: p.created_at.split('T')[0],
    objectives: [],
    sessionQueue: [],
    playerPin: p.player_pin ?? '0000',
  };
}

export const patientService = {

  /**
   * Carga todos los pacientes del terapeuta actual.
   * En producción filtrará por therapist_id cuando haya auth.
   */
  async getAll(): Promise<Patient[]> {
    if (!isSupabaseAvailable || !supabase) {
      return getLocalPatients();
    }

    const therapistId = await getCurrentTherapistId();
    
    let query = supabase
      .from('patients')
      .select('*');

    // Solo filtramos si hay un ID real (para desarrollo sin auth)
    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('[patientService] Error fetching patients:', error);
      return getLocalPatients();
    }

    if (!data || data.length === 0) return [];

    const patients = data.map(supabaseToStore);
    // Actualizar caché local
    saveLocalPatients(patients);
    return patients;
  },

  /**
   * Crea un nuevo paciente en Supabase y devuelve el Patient con UUID real.
   * Si Supabase no está disponible, genera un UUID local.
   */
  async create(input: {
    name: string;
    age: number;
    avatar: string;
    diagnosis?: string;
  }): Promise<Patient | null> {
    const therapistId = await getCurrentTherapistId();
    if (!therapistId) return null;

    const newRecord = {
      therapist_id: therapistId,
      name: input.name,
      age: input.age,
      avatar_emoji: input.avatar,
      current_level: 'pregamer',
      diagnosis: input.diagnosis ?? null,
    };

    if (!isSupabaseAvailable || !supabase) {
      // Fallback: UUID generado en cliente
      const local: Patient = {
        id: crypto.randomUUID(),
        name: input.name,
        age: input.age,
        avatar: input.avatar,
        diagnosis: input.diagnosis,
        currentLevel: 'pregamer',
        startDate: new Date().toISOString().split('T')[0],
        lastSession: new Date().toISOString().split('T')[0],
        objectives: [],
        sessionQueue: [],
      };
      const existing = getLocalPatients();
      saveLocalPatients([...existing, local]);
      return local;
    }

    const { data, error } = await supabase
      .from('patients')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[patientService] Error creating patient:', error);
      return null;
    }

    return supabaseToStore(data);
  },

  /**
   * Actualiza datos básicos de un paciente.
   */
  async update(patientId: string, changes: Partial<{
    name: string;
    age: number;
    avatar_emoji: string;
    diagnosis: string;
    current_level: string;
  }>): Promise<void> {
    if (!isSupabaseAvailable || !supabase) return;

    const { error } = await supabase
      .from('patients')
      .update(changes)
      .eq('id', patientId);

    if (error) console.error('[patientService] Error updating patient:', error);
  },

  /**
   * Elimina un paciente y todos sus datos relacionados (CASCADE en DB).
   */
  async delete(patientId: string): Promise<void> {
    if (!isSupabaseAvailable || !supabase) {
      const existing = getLocalPatients();
      saveLocalPatients(existing.filter(p => p.id !== patientId));
      return;
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (error) console.error('[patientService] Error deleting patient:', error);
  },

  async getHomework(patientId: string): Promise<string[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('patients')
      .select('homework_way_ids')
      .eq('id', patientId)
      .single();
    
    if (error) {
      console.error('[PatientService] getHomework error:', error);
      return [];
    }
    return data?.homework_way_ids ?? [];
  },

  async setHomework(patientId: string, wayIds: string[]): Promise<void> {
    if (!supabase) throw new Error('Supabase no disponible');
    
    const { error } = await supabase
      .from('patients')
      .update({ homework_way_ids: wayIds })
      .eq('id', patientId);
    
    if (error) {
      console.error('[PatientService] setHomework error:', error);
      throw error;
    }
  }
};
