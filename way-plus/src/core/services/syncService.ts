import { supabase, isSupabaseAvailable } from './supabaseClient';

export interface PatientSyncData {
  patientId: string;
  coins: number;
  inventory: string[];
  equippedAvatarId: string | null;
  completedWays: string[];
  currentLevel: string;
}

export interface TherapistNote {
  id: string;
  patient_id: string;
  content: string;
  created_at: string;
  author_id?: string;
}

export const syncService = {
  /**
   * Pushes full patient state to Supabase.
   * Tables: patient_profiles
   */
  async pushProgress(data: PatientSyncData): Promise<void> {
    if (!isSupabaseAvailable || !supabase) return;

    const { error } = await supabase
      .from('patient_profiles')
      .upsert({
        id: data.patientId,
        coins: data.coins,
        inventory: data.inventory,
        equipped_avatar_id: data.equippedAvatarId,
        completed_ways: data.completedWays,
        current_level: data.currentLevel,
        last_sync: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Sync] Error pushing progress:', error);
      throw error;
    }
  },

  /**
   * Pulls patient state from Supabase.
   */
  async pullProgress(patientId: string): Promise<PatientSyncData | null> {
    if (!isSupabaseAvailable || !supabase) return null;

    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[Sync] Error pulling progress:', error);
      return null;
    }

    return {
      patientId: data.id,
      coins: data.coins,
      inventory: data.inventory || [],
      equippedAvatarId: data.equipped_avatar_id,
      completedWays: data.completed_ways || [],
      currentLevel: data.current_level
    };
  },

  /**
   * Logs a specific way completion for analytics.
   * Tables: activity_logs
   */
  async logActivity(patientId: string, wayId: string, attempts: number, isDaily: boolean): Promise<void> {
    if (!isSupabaseAvailable || !supabase) return;

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        patient_id: patientId,
        way_id: wayId,
        attempts: attempts,
        is_daily: isDaily,
        timestamp: new Date().toISOString()
      });

    if (error) console.error('[Sync] Error logging activity:', error);
  },

  /**
   * Therapist Notes
   */
  async getNotes(patientId: string): Promise<TherapistNote[]> {
    if (!isSupabaseAvailable || !supabase) return [];

    const { data, error } = await supabase
      .from('therapist_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Sync] Error fetching notes:', error);
      return [];
    }

    return data;
  },

  async addNote(patientId: string, content: string): Promise<TherapistNote | null> {
    if (!isSupabaseAvailable || !supabase) return null;

    const { data, error } = await supabase
      .from('therapist_notes')
      .insert({
        patient_id: patientId,
        content: content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Sync] Error adding note:', error);
      return null;
    }

    return data;
  },

  async deleteNote(noteId: string): Promise<void> {
    if (!isSupabaseAvailable || !supabase) return;
    const { error } = await supabase.from('therapist_notes').delete().eq('id', noteId);
    if (error) console.error('[Sync] Error deleting note:', error);
  },

  /**
   * Analytics: Get completion counts by week
   */
  async getWeeklyStats(patientId: string) {
    if (!isSupabaseAvailable || !supabase) return [];

    // Simple implementation: fetch last 30 days and group in JS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('timestamp, way_id')
      .eq('patient_id', patientId)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (error) return [];
    return data;
  }
};
