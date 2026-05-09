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
  action: 'way_started' | 'way_completed' | 'way_abandoned' | 'hint_used';
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

/**
 * Registra un evento puntual de actividad (Explícito)
 */
export async function logActivity(data: ActivityLogData): Promise<void> {
  if (!isSupabaseAvailable || !supabase || !isUUID(data.patientId)) return;

  SyncLogger.start('logActivity', data);

  const { error } = await supabase.from('activity_logs').insert({
    patient_id: data.patientId,
    way_id: data.wayId,
    action: data.action,
    attempts: data.attempts ?? 1,
    is_daily: false,
    metadata: data.metadata ?? {},
    timestamp: new Date().toISOString(), // Legacy column
    created_at: new Date().toISOString(),
  });

  if (error) {
    SyncLogger.error('logActivity', error);
    throw error;
  }

  SyncLogger.ok('logActivity', { wayId: data.wayId, action: data.action });
}

/**
 * Persiste un logro desbloqueado (Explícito)
 */
export async function pushAchievement(patientId: string, achievementId: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return;

  SyncLogger.start('pushAchievement', { patientId, achievementId });

  const { error } = await supabase
    .from('patient_achievements')
    .insert({ patient_id: patientId, achievement_id: achievementId });

  // 23505 = unique_violation (ya lo tiene). Ignoramos.
  if (error && error.code !== '23505') {
    SyncLogger.error('pushAchievement', error);
    throw error;
  }

  SyncLogger.ok('pushAchievement', { achievementId });
}

/**
 * Sincroniza el estado general del perfil (Reactivo)
 */
export async function pushProgress(data: PatientSyncData): Promise<void> {
  if (!isSupabaseAvailable || !supabase || !isUUID(data.patientId)) return;

  SyncLogger.start('pushProgress', { id: data.patientId });

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

  if (error) {
    SyncLogger.error('pushProgress', error);
    throw error;
  }

  SyncLogger.ok('pushProgress', { coins: data.coins });
}

/**
 * Descarga el estado completo incluyendo logros
 */
export async function pullProgress(patientId: string) {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;

  SyncLogger.start('pullProgress', { patientId });

  const [profileRes, achRes] = await Promise.all([
    supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .single(),
    supabase
      .from('patient_achievements')
      .select('achievement_id')
      .eq('patient_id', patientId)
  ]);

  if (profileRes.error) {
    SyncLogger.error('pullProgress:profile', profileRes.error);
    return null;
  }

  const result = {
    name: profileRes.data.name,
    avatar: profileRes.data.equipped_avatar_id,
    completedWays: profileRes.data.completed_ways ?? [],
    coins: profileRes.data.coins ?? 0,
    currentLevel: profileRes.data.current_level ?? 'pregamer',
    accessibilityConfig: profileRes.data.accessibility_config,
    performanceConfig: profileRes.data.performance_config,
    achievements: achRes.data?.map(a => a.achievement_id) ?? [],
  };

  SyncLogger.ok('pullProgress', { achievements: result.achievements.length });
  return result;
}

/**
 * Gestión de Notas Clínicas
 */
export async function getNotes(patientId: string): Promise<TherapistNote[]> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return [];
  const { data, error } = await supabase
    .from('therapist_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) {
    SyncLogger.error('getNotes', error);
    return [];
  }
  return data;
}

export async function addNote(patientId: string, content: string): Promise<TherapistNote | null> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;
  const { data, error } = await supabase
    .from('therapist_notes')
    .insert({ patient_id: patientId, content })
    .select()
    .single();
  if (error) {
    SyncLogger.error('addNote', error);
    return null;
  }
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  const { error } = await supabase
    .from('therapist_notes')
    .delete()
    .eq('id', id);
  if (error) SyncLogger.error('deleteNote', error);
}

/**
 * Gestión de Recomendaciones (Family Hub)
 */
export async function getRecommendations(patientId: string): Promise<TherapistRecommendation[]> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return [];
  const { data, error } = await supabase
    .from('therapist_recommendations')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) {
    SyncLogger.error('getRecommendations', error);
    return [];
  }
  return data;
}

export async function addRecommendation(
  patientId: string, 
  rec: Pick<TherapistRecommendation, 'title' | 'advice' | 'category'>
): Promise<TherapistRecommendation | null> {
  if (!isSupabaseAvailable || !supabase || !isUUID(patientId)) return null;
  const { data, error } = await supabase
    .from('therapist_recommendations')
    .insert({ patient_id: patientId, ...rec, status: 'active' })
    .select()
    .single();
  if (error) {
    SyncLogger.error('addRecommendation', error);
    return null;
  }
  return data;
}

export async function deleteRecommendation(id: string, patientId: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  const { error } = await supabase
    .from('therapist_recommendations')
    .delete()
    .eq('id', id)
    .eq('patient_id', patientId);
  if (error) SyncLogger.error('deleteRecommendation', error);
}

export async function updateRecommendationStatus(
  id: string, 
  patientId: string, 
  status: 'completed' | 'dismissed'
): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  const dbStatus = status === 'completed' ? 'completed' : 'ignored';
  const { error } = await supabase
    .from('therapist_recommendations')
    .update({ status: dbStatus })
    .eq('id', id)
    .eq('patient_id', patientId);
  if (error) SyncLogger.error('updateRecommendationStatus', error);
}

export const syncService = {
  pushProgress,
  pullProgress,
  logActivity,
  pushAchievement,
  getNotes,
  addNote,
  deleteNote,
  getRecommendations,
  addRecommendation,
  deleteRecommendation,
  updateRecommendationStatus,
  isSupabaseAvailable: () => isSupabaseAvailable
};
