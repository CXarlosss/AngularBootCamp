import { supabase } from '@/core/services/supabaseClient';
import type { 
  ClinicalAnnex, 
  ClinicalAnnexType, 
  ClinicalAnnexAutoData,
  ClinicalAnnexContent 
} from '../types/clinicalAnnex';
import { addDays } from 'date-fns';

const DB_NAME = 'wayplus-offline';
const STORE_NAME = 'clinical_annexes';

// --- IndexedDB Offline Queue (mismo patrón que activity_logs) ---
async function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(annex: ClinicalAnnex): Promise<void> {
  const db = await getIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(annex);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFromIndexedDB(id: string): Promise<ClinicalAnnex | undefined> {
  const db = await getIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- Pre-fill desde activity_logs ---
async function buildAutoData(
  patientId: string, 
  weekStart: string
): Promise<ClinicalAnnexAutoData> {
  const weekEnd = addDays(new Date(weekStart), 6).toISOString();
  
  if (!supabase) {
    return {
      ways_completed_this_week: 0,
      total_time_minutes: 0,
      homework_completion_rate: 0,
      last_session_date: null,
    };
  }

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('action, metadata, created_at')
    .eq('patient_id', patientId)
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd)
    .order('created_at', { ascending: true });

  const completed = logs?.filter(l => l.action === 'way_completed') || [];
  const homework = completed.filter(l => l.metadata?.isHomework);
  
  const totalMs = logs?.reduce((sum, l) => sum + (l.metadata?.timeSpentMs || 0), 0) || 0;

  return {
    ways_completed_this_week: completed.length,
    total_time_minutes: Math.round(totalMs / 60000),
    homework_completion_rate: homework.length > 0 
      ? Math.round((homework.length / completed.length) * 100) 
      : 0,
    last_session_date: logs?.[logs.length - 1]?.created_at || null,
  };
}

// --- CRUD Público ---
export async function getOrCreateAnnex(
  patientId: string,
  therapistId: string,
  weekStart: string,
  type: ClinicalAnnexType
): Promise<ClinicalAnnex> {
  // 1. Buscar en Supabase
  if (supabase) {
    const { data: existing } = await supabase
      .from('clinical_annexes')
      .select('*')
      .eq('patient_id', patientId)
      .eq('week_start', weekStart)
      .eq('type', type)
      .single();

    if (existing) return existing as ClinicalAnnex;
  }

  // 2. Crear nuevo con auto-fill
  const autoData = await buildAutoData(patientId, weekStart);
  
  const newAnnex: Omit<ClinicalAnnex, 'id' | 'created_at' | 'updated_at'> = {
    patient_id: patientId,
    therapist_id: therapistId,
    week_start: weekStart,
    type,
    content: {},
    auto_data: autoData,
    status: 'draft',
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('clinical_annexes')
      .insert(newAnnex)
      .select()
      .single();

    if (data && !error) return data as ClinicalAnnex;
  }

  // 3. Fallback offline: crear localmente y encolar
  const offlineAnnex: ClinicalAnnex = {
    ...newAnnex,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveToIndexedDB(offlineAnnex);
  return offlineAnnex;
}

export async function updateAnnexContent(
  annexId: string,
  content: ClinicalAnnexContent,
  status: 'draft' | 'completed' = 'draft'
): Promise<ClinicalAnnex> {
  if (supabase && !annexId.startsWith('local-')) {
    const { data, error } = await supabase
      .from('clinical_annexes')
      .update({ content, status, updated_at: new Date().toISOString() })
      .eq('id', annexId)
      .select()
      .single();

    if (data && !error) return data as ClinicalAnnex;
  }

  // Fallback offline
  const local = await getFromIndexedDB(annexId);
  if (local) {
    const updated = { ...local, content, status, updated_at: new Date().toISOString() };
    await saveToIndexedDB(updated);
    return updated;
  }

  throw new Error('Annex not found for offline update');
}

export async function getWeekStatus(
  patientId: string,
  weekStart: string
): Promise<{ type: ClinicalAnnexType; status: 'empty' | 'draft' | 'completed' }[]> {
  const types: ClinicalAnnexType[] = ['relaxation', 'selfcheck', 'roleplay'];
  let data: any[] | null = null;
  
  if (supabase) {
    const res = await supabase
      .from('clinical_annexes')
      .select('type, status')
      .eq('patient_id', patientId)
      .eq('week_start', weekStart);
    data = res.data;
  }

  // Also check offline forms for this week
  const db = await getIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const localItems = await new Promise<ClinicalAnnex[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const offlineFormsForWeek = localItems.filter(a => a.patient_id === patientId && a.week_start === weekStart);

  return types.map(type => {
    const offlineFound = offlineFormsForWeek.find(d => d.type === type);
    if (offlineFound) return { type, status: offlineFound.status };

    const found = data?.find(d => d.type === type);
    return { type, status: found?.status || 'empty' };
  });
}

export async function flushOfflineAnnexes(): Promise<void> {
  if (!supabase) return;

  const db = await getIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise<ClinicalAnnex[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const pending = all.filter(a => a.id.startsWith('local-'));
  for (const annex of pending) {
    const { id, ...rest } = annex;
    const { data } = await supabase
      .from('clinical_annexes')
      .upsert(rest, { onConflict: 'patient_id,week_start,type' })
      .select()
      .single();

    if (!data) {
      console.error('Flush failed for annex:', annex);
      continue;
    }

    const delTx = db.transaction(STORE_NAME, 'readwrite');
    delTx.objectStore(STORE_NAME).delete(id);
  }
}
