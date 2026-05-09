/**
 * sessionService.ts
 * Capa de datos para planned_sessions.
 */

import { supabase, isSupabaseAvailable } from './supabaseClient';

export type SessionStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface WaySummary {
  duration_seconds: number;
  attempts: number;
  completed: boolean;
}

export interface SessionSummary {
  ways_completed: string[];
  ways_skipped: string[];
  duration_seconds: number;
  per_way: Record<string, WaySummary>;
  clinical_observations?: string;
}

export interface PlannedSession {
  id: string;
  patient_id: string;
  therapist_id: string | null;
  status: SessionStatus;
  way_ids: string[];
  notes: string | null;
  session_date: string;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  summary: Partial<SessionSummary>;
}

const LOCAL_KEY = (patientId: string) => `way_sessions_${patientId}`;

function getLocalSessions(patientId: string): PlannedSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY(patientId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSessions(patientId: string, sessions: PlannedSession[]): void {
  localStorage.setItem(LOCAL_KEY(patientId), JSON.stringify(sessions));
}

export const sessionService = {

  async createSession(
    patientId: string,
    wayIds: string[],
    notes?: string,
    sessionDate?: string
  ): Promise<PlannedSession | null> {
    const newSession: Omit<PlannedSession, 'id' | 'created_at'> = {
      patient_id: patientId,
      therapist_id: null,
      status: 'draft',
      way_ids: wayIds,
      notes: notes ?? null,
      session_date: sessionDate ?? new Date().toISOString().split('T')[0],
      activated_at: null,
      completed_at: null,
      summary: {},
    };

    if (!isSupabaseAvailable || !supabase) {
      const local: PlannedSession = {
        ...newSession,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const existing = getLocalSessions(patientId);
      saveLocalSessions(patientId, [local, ...existing]);
      return local;
    }

    const { data, error } = await supabase
      .from('planned_sessions')
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error('[sessionService] Error creating session:', error);
      return null;
    }
    return data;
  },

  async getSessions(patientId: string): Promise<PlannedSession[]> {
    if (!isSupabaseAvailable || !supabase) {
      return getLocalSessions(patientId);
    }

    const { data, error } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[sessionService] Error fetching sessions:', error);
      return getLocalSessions(patientId);
    }
    return data;
  },

  async getActiveSession(patientId: string): Promise<PlannedSession | null> {
    if (!isSupabaseAvailable || !supabase) {
      const local = getLocalSessions(patientId);
      return local.find(s => s.status === 'active') ?? null;
    }

    const { data, error } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('[sessionService] Error fetching active session:', error);
      return null;
    }
    return data;
  },

  async activateSession(sessionId: string, patientId: string): Promise<PlannedSession | null> {
    if (!isSupabaseAvailable || !supabase) {
      const sessions = getLocalSessions(patientId);
      const updated = sessions.map(s => {
        if (s.status === 'active') return { ...s, status: 'cancelled' as SessionStatus };
        if (s.id === sessionId) return { ...s, status: 'active' as SessionStatus, activated_at: new Date().toISOString() };
        return s;
      });
      saveLocalSessions(patientId, updated);
      return updated.find(s => s.id === sessionId) ?? null;
    }

    await supabase
      .from('planned_sessions')
      .update({ status: 'cancelled' })
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .neq('id', sessionId);

    const { data, error } = await supabase
      .from('planned_sessions')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[sessionService] Error activating session:', error);
      return null;
    }
    return data;
  },

  async updateDraft(
    sessionId: string,
    patientId: string,
    changes: { way_ids?: string[]; notes?: string }
  ): Promise<PlannedSession | null> {
    if (!isSupabaseAvailable || !supabase) {
      const sessions = getLocalSessions(patientId);
      const updated = sessions.map(s =>
        s.id === sessionId && s.status === 'draft' ? { ...s, ...changes } : s
      );
      saveLocalSessions(patientId, updated);
      return updated.find(s => s.id === sessionId) ?? null;
    }

    const { data, error } = await supabase
      .from('planned_sessions')
      .update(changes)
      .eq('id', sessionId)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      console.error('[sessionService] Error updating draft:', error);
      return null;
    }
    return data;
  },

  async completeSession(
    sessionId: string,
    patientId: string,
    summary: SessionSummary
  ): Promise<PlannedSession | null> {
    if (!isSupabaseAvailable || !supabase) {
      const sessions = getLocalSessions(patientId);
      const updated = sessions.map(s =>
        s.id === sessionId
          ? { ...s, status: 'completed' as SessionStatus, completed_at: new Date().toISOString(), summary }
          : s
      );
      saveLocalSessions(patientId, updated);
      return updated.find(s => s.id === sessionId) ?? null;
    }

    const { data, error } = await supabase
      .from('planned_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        summary,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[sessionService] Error completing session:', error);
      return null;
    }
    return data;
  },

  /**
   * Actualiza solo las observaciones clínicas de una sesión ya completada.
   * No cambia el status ni otros campos.
   */
  async updateSessionNotes(
    sessionId: string,
    patientId: string,
    clinicalObservations: string
  ): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
      const sessions = getLocalSessions(patientId);
      const updated = sessions.map(s =>
        s.id === sessionId
          ? { ...s, summary: { ...s.summary, clinical_observations: clinicalObservations } }
          : s
      );
      saveLocalSessions(patientId, updated);
      return true;
    }

    // Supabase no permite actualizar un campo JSONB anidado directamente,
    // así que primero leemos el summary actual y luego lo actualizamos completo.
    const { data: current, error: fetchError } = await supabase
      .from('planned_sessions')
      .select('summary')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      console.error('[sessionService] Error fetching session for notes update:', fetchError);
      return false;
    }

    const updatedSummary = {
      ...(current.summary ?? {}),
      clinical_observations: clinicalObservations,
    };

    const { error } = await supabase
      .from('planned_sessions')
      .update({ summary: updatedSummary })
      .eq('id', sessionId);

    if (error) {
      console.error('[sessionService] Error updating session notes:', error);
      return false;
    }
    return true;
  },

  async deleteDraft(sessionId: string, patientId: string): Promise<void> {
    if (!isSupabaseAvailable || !supabase) {
      const sessions = getLocalSessions(patientId);
      saveLocalSessions(patientId, sessions.filter(s => s.id !== sessionId || s.status !== 'draft'));
      return;
    }

    const { error } = await supabase
      .from('planned_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('status', 'draft');

    if (error) console.error('[sessionService] Error deleting draft:', error);
  },
};
