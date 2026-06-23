import { supabase } from '@/core/services/supabaseClient';
import type { FamilyDashboardData, HomeworkStatus } from '../types/familyHub';

const DB_NAME = 'wayplus-family';
const STORE_NAME = 'family_cache';

async function getFamilyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'token' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- Validación de token (Edge Function) ---
export async function validateFamilyToken(token: string): Promise<{ patient_id: string; valid: boolean }> {
  if (!supabase) throw new Error('Servicio offline');
  const { data, error } = await supabase.functions.invoke('family-auth', {
    body: { token },
  });
  
  if (error || !data?.valid) throw new Error('Token inválido o expirado');
  return data;
}

// --- Dashboard data (solo lectura) ---
export async function getFamilyDashboard(patientId: string): Promise<FamilyDashboardData> {
  if (!supabase) throw new Error('Servicio offline');
  // 1. Intentar Supabase
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('coins, current_level, completed_ways')
    .eq('patient_id', patientId)
    .single();

  const { data: patient } = await supabase
    .from('patients')
    .select('name, avatar_emoji, gender, homework_way_ids')
    .eq('id', patientId)
    .single();

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('way_id, action, created_at, metadata')
    .eq('patient_id', patientId)
    .eq('action', 'way_completed')
    .order('created_at', { ascending: false });

  const completedSet = new Set(profile?.completed_ways || []);
  const homeworkIds = patient?.homework_way_ids || [];
  
  const homeworkStatus: HomeworkStatus[] = homeworkIds.map((wayId: string) => {
    const log = logs?.find((l: any) => l.way_id === wayId);
    return {
      way_id: wayId,
      way_title: `Way ${wayId}`, // Se resuelve con join a tabla ways si es necesario
      completed: completedSet.has(wayId),
      completed_at: log?.created_at,
    };
  });

  const result: FamilyDashboardData = {
    patient_id: patientId,
    patient_name: patient?.name || 'Paciente',
    avatar_emoji: patient?.avatar_emoji || '👤',
    gender: patient?.gender || 'neutral',
    coins: profile?.coins || 0,
    current_level: profile?.current_level || 1,
    completed_ways: profile?.completed_ways || [],
    completed_ways_count: profile?.completed_ways?.length || 0,
    total_ways: 57,
    avatar_progress_percent: Math.round(((profile?.completed_ways?.length || 0) / 57) * 100),
    homework_pending: homeworkStatus.filter(h => !h.completed).length,
    homework_completed_this_week: homeworkStatus.filter(h => h.completed).length,
  };

  // 2. Cachear en IndexedDB para offline
  const db = await getFamilyDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ token: patientId, data: result, timestamp: Date.now() });

  return result;
}

// --- Notificaciones: suscripción a homework completados ---
export function subscribeToHomeworkCompletions(
  patientId: string,
  onHomeworkCompleted: (wayId: string, wayTitle: string) => void
) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`family-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        const log = payload.new as any;
        if (log.action === 'way_completed' && log.metadata?.isHomework) {
          onHomeworkCompleted(log.way_id, `Way ${log.way_id}`);
        }
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
