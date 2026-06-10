import { supabase, isSupabaseAvailable } from './supabaseClient';

export interface PatientProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  currentLevel: string;
  coins: number;
  completedWays?: string[];
  inventory?: string[];
  homeworkWayIds?: string[];
  pin?: string;
}

/**
 * Servicio para la gestión de perfiles de pacientes (Niños)
 * Conectado a Supabase para persistencia clínica multiplataforma.
 */
export const patientService = {
  /**
   * Obtiene todos los perfiles registrados. 
   */
  async getAll(): Promise<PatientProfile[]> {
    if (!isSupabaseAvailable || !supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    let therapistId = user?.id;

    if (!therapistId && localStorage.getItem('way-demo-mode') === 'true') {
      therapistId = '00000000-0000-0000-0000-000000000000';
    }

    if (!therapistId) return [];

    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('therapist_id', therapistId)
      .order('name');

    if (error) {
      console.error('[patientService] Error al obtener perfiles:', error);
      return [];
    }

    return data.map(p => ({
      id: p.id,
      name: p.name || 'Invitado',
      avatar: p.equipped_avatar_id || 'base-unicorn',
      age: p.age || 6,
      currentLevel: p.current_level || 'pregamer',
      coins: p.coins || 0,
      completedWays: p.completed_ways || [],
      inventory: p.inventory || [],
      pin: p.pin || '0000',
    }));
  },

  /**
   * Crea un nuevo perfil de niño
   */
  async create(payload: { name: string; age: number; avatar: string }): Promise<PatientProfile | null> {
    if (!isSupabaseAvailable || !supabase) return null;

    // Obtener el ID del terapeuta actual
    const { data: { user } } = await supabase.auth.getUser();
    
    let therapistId = user?.id;

    // Si estamos en modo demo, permitimos un ID virtual
    if (!therapistId && localStorage.getItem('way-demo-mode') === 'true') {
      therapistId = '00000000-0000-0000-0000-000000000000';
    }

    if (!therapistId) {
      console.error('[patientService] No hay sesión de terapeuta activa');
      return null;
    }

    const newId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert({
        id: newId,
        therapist_id: therapistId,
        name: payload.name,
        age: payload.age,
        equipped_avatar_id: payload.avatar,
        current_level: 'pregamer',
        coins: 0,
        inventory: [],
        completed_ways: [],
        pin: Math.floor(1000 + Math.random() * 9000).toString()
      })
      .select()
      .single();

    if (error) {
      console.error('[patientService] Error al crear perfil:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      avatar: data.equipped_avatar_id,
      age: data.age,
      currentLevel: data.current_level,
      coins: data.coins,
      completedWays: data.completed_ways || [],
      inventory: data.inventory || [],
      pin: data.pin,
    };
  },

  /**
   * Actualiza un perfil existente
   */
  async update(id: string, updates: any): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) return false;

    // Mapear campos de camelCase a snake_case para Supabase
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.age) dbUpdates.age = updates.age;
    if (updates.avatar) dbUpdates.equipped_avatar_id = updates.avatar;
    if (updates.currentLevel) dbUpdates.current_level = updates.currentLevel;
    if (updates.coins !== undefined) dbUpdates.coins = updates.coins;
    if (updates.gender) dbUpdates.gender = updates.gender;
    if (updates.pin) dbUpdates.pin = updates.pin;

    const { error } = await supabase
      .from('patient_profiles')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('[patientService] Error al actualizar perfil:', error);
      return false;
    }

    return true;
  },

  /**
   * Obtiene las tareas asignadas para casa
   */
  async getHomework(patientId: string): Promise<string[]> {
    if (!isSupabaseAvailable || !supabase || !patientId) return [];
    
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('homework_way_ids')
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('[patientService] Error al obtener tareas:', error);
      return [];
    }

    return data.homework_way_ids || [];
  },

  /**
   * Asigna tareas para casa
   */
  async setHomework(patientId: string, wayIds: string[]): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase || !patientId) return false;

    const { error } = await supabase
      .from('patient_profiles')
      .update({ homework_way_ids: wayIds })
      .eq('id', patientId);

    if (error) {
      console.error('[patientService] Error al asignar tareas:', error);
      return false;
    }

    return true;
  }
};
