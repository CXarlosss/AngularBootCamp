import { supabase, isSupabaseAvailable } from './supabaseClient';

// ============================================
// UTILIDADES Y LOGGING
// ============================================
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const SyncLogger = {
  start: (op: string, params: any) => console.log(`[Sync:${op}:start]`, params),
  ok: (op: string, result: any) => console.log(`[Sync:${op}:ok]`, result),
  error: (op: string, err: any) => console.error(`[Sync:${op}:error]`, err),
};

// ============================================
// ESTADO DE SINCRONIZACIÓN Y EVENTOS
// ============================================
export type SyncStatusState = 'synced' | 'syncing' | 'offline';

type SyncListener = (status: SyncStatusState) => void;
const listeners = new Set<SyncListener>();
let currentSyncStatus: SyncStatusState = navigator.onLine ? 'synced' : 'offline';

export function subscribeToSyncStatus(listener: SyncListener) {
  listeners.add(listener);
  listener(currentSyncStatus);
  return () => listeners.delete(listener);
}

function updateSyncStatus(status: SyncStatusState) {
  if (currentSyncStatus !== status) {
    currentSyncStatus = status;
    listeners.forEach(l => l(status));
  }
}

// Escuchar cambios de red nativos
window.addEventListener('online', () => updateSyncStatus('synced'));
window.addEventListener('offline', () => updateSyncStatus('offline'));

// ============================================
// TIPOS
// ============================================
export interface PatientSyncData {
  patientId: string;
  coins: number;
  inventory: string[];
  equippedAvatarId: string | null;
  completedWays: string[];
  currentLevel: string;
  accessibilityConfig?: any;
  performanceConfig?: any;
}

export interface ActivityLogData {
  patientId: string;
  wayId: string;
  action: 'way_started' | 'way_completed' | 'way_abandoned' | 'hint_used' | 'session_start' | 'session_end';
  attempts?: number;
  metadata?: Record<string, any>;
}

export interface TherapistNote {
  id: string;
  patient_id: string;
  content: string;
  created_at: string;
}

export interface TherapistRecommendation {
  id: string;
  patient_id: string;
  title: string;
  advice: string;
  category: 'autonomy' | 'regulation' | 'social' | 'asertivity' | 'general';
  status: 'active' | 'completed' | 'ignored';
  created_at: string;
}

// ============================================
// MÉTODOS DE SINCRONIZACIÓN
// ============================================

async function getLogQueue(): Promise<ActivityLogData[]> {
  try {
    const { get, createStore } = await import('idb-keyval');
    const store = createStore('way-logs', 'queue');
    return (await get('pending-logs', store)) || [];
  } catch { return []; }
}

async function setLogQueue(logs: ActivityLogData[]): Promise<void> {
  try {
    const { set, createStore } = await import('idb-keyval');
    const store = createStore('way-logs', 'queue');
    await set('pending-logs', logs, store);
  } catch { /* ignore */ }
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  // 1. Add to local queue immediately
  const queue = await getLogQueue();
  const queuedAt = new Date().toISOString();
  queue.push({ ...data, metadata: { ...data.metadata, queued_at: queuedAt } });
  await setLogQueue(queue);

  // 2. Try to flush queue if online
  if (navigator.onLine && isSupabaseAvailable && supabase) {
    try {
      const currentQueue = await getLogQueue();
      if (currentQueue.length === 0) {
        updateSyncStatus('synced');
        return;
      }

      updateSyncStatus('syncing');

      const activePatientId = sessionStorage.getItem('way-active-patient');
      const activePin = sessionStorage.getItem('way-active-pin');

      const validLogs = currentQueue.filter(l => isUUID(l.patientId)).map(l => ({
        patient_id: l.patientId,
        way_id: l.wayId,
        action: l.action,
        attempts: l.attempts ?? 1,
        metadata: l.metadata ?? {},
      }));

      // Si tenemos PIN para el paciente activo, procesamos todo por la Edge Function
      if (activePatientId && activePin) {
        // Enviar solo los logs del paciente activo (o delegamos todo al paciente activo)
        const patientLogs = validLogs.filter(l => l.patient_id === activePatientId);
        if (patientLogs.length === 0) return;

        const { error } = await supabase.functions.invoke('log-activity', {
          body: {
            patient_id: activePatientId,
            pin: activePin,
            logs: patientLogs
          }
        });

        if (!error) {
          // Success: clear the logs we just sent
          const flushedTimestamps = patientLogs.map(l => l.metadata?.queued_at);
          const remaining = (await getLogQueue()).filter(l => !flushedTimestamps.includes(l.metadata?.queued_at));
          await setLogQueue(remaining);
          console.log(`[Sync] Flushed ${patientLogs.length} activity logs via Edge Function`);
          updateSyncStatus('synced');
        } else {
          console.warn('[Sync] Edge Function rejected logs:', error);
          updateSyncStatus('offline');
        }
      } else {
        console.warn('[Sync] Cannot flush: No active PIN found in session storage.');
        updateSyncStatus('offline');
      }
    } catch (e) {
      console.warn('[Sync] Failed to flush logs, will retry later:', e);
      updateSyncStatus('offline');
    }
  } else {
    updateSyncStatus('offline');
  }
}

export async function logActivityBatch(logs: ActivityLogData[]): Promise<void> {
  if (!isSupabaseAvailable || !supabase || logs.length === 0) return;
  
  const activePatientId = sessionStorage.getItem('way-active-patient');
  const activePin = sessionStorage.getItem('way-active-pin');
  
  if (!activePatientId || !activePin) {
    throw new Error('No active patient or PIN found for logging');
  }

  const validLogs = logs.filter(l => isUUID(l.patientId) && l.patientId === activePatientId).map(l => ({
    patient_id: l.patientId,
    way_id: l.wayId,
    action: l.action,
    attempts: l.attempts ?? 1,
    metadata: l.metadata ?? {},
  }));

  if (validLogs.length === 0) return;

  const { error } = await supabase.functions.invoke('log-activity', {
    body: {
      patient_id: activePatientId,
      pin: activePin,
      logs: validLogs
    }
  });

  if (error) throw error;
}

export async function pushAchievement(patientId: string, achievementId: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return;
  const { error } = await supabase
    .from('patient_achievements')
    .insert({ patient_id: patientId, achievement_id: achievementId });
  if (error && error.code !== '23505') throw error;
}

export async function pushProgress(data: PatientSyncData): Promise<void> {
  if (!isSupabaseAvailable || !supabase || !isUUID(data.patientId)) return;
  const { error } = await supabase
    .from('patient_profiles')
    .upsert({
      id: data.patientId,
      coins: data.coins,
      inventory: data.inventory,
      equipped_avatar_id: data.equippedAvatarId,
      completed_ways: data.completedWays,
      current_level: data.currentLevel,
      accessibility_config: data.accessibilityConfig,
      performance_config: data.performanceConfig,
      last_sync: new Date().toISOString(),
    }, { onConflict: 'id' });
  if (error) throw error;
}

export async function pullProgress(patientId: string) {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;
  const [profileRes, achRes] = await Promise.all([
    supabase.from('patient_profiles').select('*').eq('id', patientId).single(),
    supabase.from('patient_achievements').select('achievement_id').eq('patient_id', patientId)
  ]);
  if (profileRes.error) return null;
  return {
    name: profileRes.data.name,
    avatar: profileRes.data.equipped_avatar_id,
    completedWays: profileRes.data.completed_ways ?? [],
    coins: profileRes.data.coins ?? 0,
    currentLevel: profileRes.data.current_level ?? 'pregamer',
    accessibilityConfig: profileRes.data.accessibility_config,
    performanceConfig: profileRes.data.performance_config,
    achievements: achRes.data?.map(a => a.achievement_id) ?? [],
    updatedAt: profileRes.data.last_sync,
  };
}

// ============================================
// MÉTODOS CLÍNICOS (NOTAS Y RECOMENDACIONES)
// ============================================

export async function getNotes(patientId: string): Promise<TherapistNote[]> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return [];
  const { data, error } = await supabase
    .from('therapist_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function addNote(patientId: string, content: string): Promise<TherapistNote | null> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;
  const { data, error } = await supabase
    .from('therapist_notes')
    .insert({ patient_id: patientId, content })
    .select()
    .single();
  return error ? null : data;
}

export async function deleteNote(id: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  await supabase.from('therapist_notes').delete().eq('id', id);
}

export async function getRecommendations(patientId: string): Promise<TherapistRecommendation[]> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return [];
  const { data, error } = await supabase
    .from('therapist_recommendations')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function addRecommendation(patientId: string, payload: any): Promise<TherapistRecommendation | null> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;
  const { data, error } = await supabase
    .from('therapist_recommendations')
    .insert({ 
      patient_id: patientId, 
      title: payload.title,
      advice: payload.advice,
      category: payload.category || 'general',
      status: 'active'
    })
    .select()
    .single();
  return error ? null : data;
}

export async function deleteRecommendation(id: string, _patientId?: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  await supabase.from('therapist_recommendations').delete().eq('id', id);
}

export async function updateRecommendationStatus(id: string, status: string, _pId?: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  await supabase.from('therapist_recommendations').update({ status }).eq('id', id);
}

export const syncService = {
  pushProgress,
  pullProgress,
  logActivity,
  logActivityBatch,
  pushAchievement,
  getNotes,
  addNote,
  deleteNote,
  getRecommendations,
  addRecommendation,
  deleteRecommendation,
  updateRecommendationStatus,
  subscribeToSyncStatus,
  isSupabaseAvailable: () => isSupabaseAvailable
};
