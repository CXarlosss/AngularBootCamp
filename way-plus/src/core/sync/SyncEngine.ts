import { syncService, type PatientSyncData, type ActivityLogData } from '@/core/services/syncService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { useConfigStore } from '@/core/stores/configStore';
import { HydrationCache } from './HydrationCache';
import { isSupabaseAvailable } from '@/core/services/supabaseClient';

const SYNC_DEBOUNCE_MS = 2000;
const CIRCUIT_BREAK_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 30_000;
const PATIENT_ID_POLL_INTERVAL_MS = 100;
const PATIENT_ID_POLL_TIMEOUT_MS = 3000;

export type SyncStatus = 'idle' | 'pushing' | 'pulling' | 'circuit_open' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: number | null;
  circuitPausedUntil: number | null;
  consecutiveErrors: number;
}

type SyncStatusListener = (state: SyncState) => void;

export class SyncEngine {
  private patientId: string | null = null;
  private isPulling = false;
  private knownAchievements = new Set<string>();
  private activityQueue: ActivityLogData[] = [];
  private unsubscribePlayer: (() => void) | null = null;
  private unsubscribeRewards: (() => void) | null = null;
  private isPushing = false;
  private pushRequested = false;
  private cleanupUnloadGuard: (() => void) | null = null;

  private syncState: SyncState = {
    status: 'idle',
    lastSyncAt: null,
    circuitPausedUntil: null,
    consecutiveErrors: 0,
  };
  private statusListeners = new Set<SyncStatusListener>();

  onStatusChange(listener: SyncStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /**
   * FIX: El reset del circuit breaker es ahora completamente LAZY.
   * Comprueba el tiempo cada vez que se pide el estado.
   */
  public push(): void {
    this.requestBackgroundPush();
  }

  getStatus(): SyncState {
    if (this.syncState.circuitPausedUntil && Date.now() > this.syncState.circuitPausedUntil) {
      this.syncState = {
        ...this.syncState,
        status: 'idle',
        circuitPausedUntil: null,
        consecutiveErrors: 0,
      };
    }
    return { ...this.syncState };
  }

  private emitStatus(patch: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...patch };
    this.statusListeners.forEach(l => l(this.getStatus()));
  }

  private get circuitOpen(): boolean {
    const status = this.getStatus();
    return status.status === 'circuit_open';
  }

  private waitForPatientId(timeoutMs = PATIENT_ID_POLL_TIMEOUT_MS): Promise<string | null> {
    return new Promise(resolve => {
      const id = sessionStorage.getItem('way-active-patient');
      if (id) return resolve(id);
      const deadline = Date.now() + timeoutMs;
      const interval = setInterval(() => {
        const found = sessionStorage.getItem('way-active-patient');
        if (found) { clearInterval(interval); resolve(found); return; }
        if (Date.now() >= deadline) { clearInterval(interval); resolve(null); }
      }, PATIENT_ID_POLL_INTERVAL_MS);
    });
  }

  async start() {
    if (!isSupabaseAvailable) return;
    const id = await this.waitForPatientId();
    if (!id) return;
    this.patientId = id;

    const { state: cached } = HydrationCache.loadWithTimestamp(id);
    if (cached) {
      usePlayerStore.getState().syncFromCloud({
        patientId: id, name: cached.name, avatar: cached.avatar,
        completedWays: cached.completedWays, currentLevel: cached.currentLevel as any,
      });
      useRewardsStore.setState({ wayCoins: cached.coins });
    }

    this.cleanupUnloadGuard = this.setupUnloadGuard();
    await this.initialPull();
    this.subscribeToStores();
  }

  stop() {
    this.unsubscribePlayer?.();
    this.unsubscribeRewards?.();
    this.cleanupUnloadGuard?.();
    this.statusListeners.clear();
    this.patientId = null;
    this.pushRequested = false;
    this.emitStatus({ status: 'idle' });
  }

  logActivity(data: Omit<ActivityLogData, 'patientId'>) {
    if (!this.patientId) return;
    this.activityQueue.push({ ...data, patientId: this.patientId });
    this.requestBackgroundPush();
  }

  private async initialPull() {
    if (!this.patientId || this.isPulling) return;
    this.isPulling = true;
    this.emitStatus({ status: 'pulling' });

    try {
      const data = await syncService.pullProgress(this.patientId);
      if (!data) return;

      // FIX: Uso de loadWithTimestamp robusto
      const { state: cached, ts: cacheTs } = HydrationCache.loadWithTimestamp(this.patientId);
      const supabaseTs = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;

      if (cacheTs > supabaseTs && cached) {
        console.info('[SyncEngine] Merge: Caché local más reciente → push');
        this.isPulling = false; // Liberamos el flag para permitir el push de sincronización
        await this.push();
      } else {
        usePlayerStore.getState().syncFromCloud({
          patientId: this.patientId, name: data.name, avatar: data.avatar,
          completedWays: data.completedWays, currentLevel: data.currentLevel as any,
        });
        useRewardsStore.setState({ wayCoins: data.coins });
        if (data.achievements) this.knownAchievements = new Set(data.achievements);
      }

      this.clearEmergencyState();
      this.emitStatus({ status: 'idle', lastSyncAt: Date.now() });
    } catch (e) {
      this.emitStatus({ status: 'error' });
    } finally {
      this.isPulling = false;
    }
  }

  private saveLocalCache() {
    if (!this.patientId) return;
    const player = usePlayerStore.getState();
    const rewards = useRewardsStore.getState();
    HydrationCache.save(this.patientId, {
      coins: rewards.wayCoins,
      completedWays: player.profile?.completedWays || [],
      avatar: player.profile?.avatar ?? '',
      name: player.profile?.name ?? '',
      currentLevel: player.profile?.currentLevel ?? 'pregamer',
    });
  }

  private subscribeToStores() {
    this.unsubscribePlayer = usePlayerStore.subscribe((s: any, p: any) => {
      if (s.profile?.completedWays !== p.profile?.completedWays) {
        this.saveLocalCache();
        this.requestBackgroundPush();
      }
    });
    this.unsubscribeRewards = useRewardsStore.subscribe((s: any, p: any) => {
      if (s.wayCoins !== p.wayCoins || s.achievements !== p.achievements) {
        this.saveLocalCache();
        this.requestBackgroundPush();
      }
    });
  }

  private requestBackgroundPush() {
    this.pushRequested = true;
    this.processPushQueue();
  }

  private async processPushQueue() {
    if (this.circuitOpen || !this.patientId || this.isPulling || this.isPushing) return;

    while (this.pushRequested) {
      this.pushRequested = false;
      this.isPushing = true;
      this.emitStatus({ status: 'pushing' });

      try {
        await this.performPush();
        this.emitStatus({ status: 'idle', lastSyncAt: Date.now(), consecutiveErrors: 0 });
      } catch (e) {
        const newErrors = this.syncState.consecutiveErrors + 1;
        if (newErrors >= CIRCUIT_BREAK_THRESHOLD) {
          this.emitStatus({
            status: 'circuit_open', consecutiveErrors: newErrors,
            circuitPausedUntil: Date.now() + CIRCUIT_RESET_MS,
          });
          this.pushRequested = false; // Stop trying if circuit is open
        } else {
          this.emitStatus({ status: 'error', consecutiveErrors: newErrors });
          // If we had a network error, wait a moment before the next retry (if requested)
          await new Promise(res => setTimeout(res, 2000));
        }
      } finally {
        this.isPushing = false;
      }
    }
  }

  private async performPush() {
    const player = usePlayerStore.getState();
    const rewards = useRewardsStore.getState();
    const currentAchIds = (rewards.achievements ?? []).map((a: any) => typeof a === 'string' ? a : a.id);
    const newAchievements = currentAchIds.filter((id: string) => !this.knownAchievements.has(id));
    
    const logsToSend = [...this.activityQueue];

    const syncData: PatientSyncData = {
      patientId: this.patientId!,
      coins: rewards.wayCoins,
      inventory: (rewards.inventory || []).map((i: any) => i.id),
      equippedAvatarId: rewards.currentAvatar?.base || null,
      completedWays: player.profile?.completedWays || [],
      currentLevel: player.profile?.currentLevel || 'pregamer',
      accessibilityConfig: useConfigStore.getState().accessibility,
      performanceConfig: useConfigStore.getState().performance,
    };

    if (logsToSend.length > 0) {
      await syncService.logActivityBatch(logsToSend);
      this.activityQueue = this.activityQueue.filter(l => !logsToSend.includes(l));
    }

    await Promise.all([
      syncService.pushProgress(syncData),
      ...newAchievements.map(id => syncService.pushAchievement(this.patientId!, id).then(() => {
        this.knownAchievements.add(id);
      }))
    ]);

    this.saveLocalCache();
  }

  private clearEmergencyState() {
    if (this.patientId) sessionStorage.removeItem('way-emergency-state');
  }

  private setupUnloadGuard() {
    const saveState = () => {
      if (!this.patientId) return;
      const player = usePlayerStore.getState();
      const rewards = useRewardsStore.getState();
      sessionStorage.setItem('way-emergency-state', JSON.stringify({
        patientId: this.patientId, completedWays: player.profile?.completedWays || [],
        coins: rewards.wayCoins, achievements: rewards.achievements,
        activityQueue: this.activityQueue,
        timestamp: Date.now(),
      }));
    };
    window.addEventListener('beforeunload', saveState);
    return () => window.removeEventListener('beforeunload', saveState);
  }
}

export const syncEngine = new SyncEngine();
