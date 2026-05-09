import { syncService, type PatientSyncData } from '@/core/services/syncService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { useConfigStore } from '@/core/stores/configStore';
import { HydrationCache } from './HydrationCache';
import { isSupabaseAvailable } from '@/core/services/supabaseClient';

const SYNC_DEBOUNCE_MS = 2000;

/**
 * SyncEngine: El orquestador de datos fuera de React.
 * Gestiona el pull inicial y el push reactivo de los perfiles.
 */
export class SyncEngine {
  private patientId: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isPulling = false;
  private knownAchievements = new Set<string>();
  private unsubscribePlayer: (() => void) | null = null;
  private unsubscribeRewards: (() => void) | null = null;
  private consecutiveErrors = 0;
  private circuitOpen = false;
  private isPushing = false;
  private cleanupUnloadGuard: (() => void) | null = null;

  async start() {
    if (!isSupabaseAvailable) {
      console.warn('[SyncEngine] Supabase no disponible, modo offline puro');
      return;
    }

    // Fix Race Condition: Reintento si el login acaba de ocurrir
    let id = sessionStorage.getItem('way-active-patient');
    if (!id) {
      await new Promise(r => setTimeout(r, 500));
      id = sessionStorage.getItem('way-active-patient');
    }

    if (!id) return;
    this.patientId = id;
    
    // 0. Hidratación instantánea (UX Anti-flash)
    const cached = HydrationCache.load(id);
    if (cached) {
      usePlayerStore.getState().syncFromCloud({
        patientId: id,
        name: cached.name,
        avatar: cached.avatar,
        completedWays: cached.completedWays,
        currentLevel: cached.currentLevel as any,
      });
      useRewardsStore.setState({ wayCoins: cached.coins });
    }

    // 1. Paracaídas de emergencia
    this.cleanupUnloadGuard = this.setupUnloadGuard();

    // 2. Pull inicial real
    this.initialPull();

    // 3. Suscripciones reactivas
    this.subscribeToStores();
  }

  stop() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.unsubscribePlayer?.();
    this.unsubscribeRewards?.();
    this.cleanupUnloadGuard?.();
    this.patientId = null;
  }

  private async initialPull() {
    if (!this.patientId || this.isPulling) return;
    this.isPulling = true;

    try {
      const data = await syncService.pullProgress(this.patientId);
      if (!data) return;

      // Hidratar stores
      usePlayerStore.getState().syncFromCloud({
        patientId: this.patientId,
        name: data.name, // Añadido
        avatar: data.avatar, // Añadido
        completedWays: data.completedWays,
        currentLevel: data.currentLevel as any,
      });

      useRewardsStore.setState({
        wayCoins: data.coins,
      });

      // Hidratar achievements y stickers sin duplicar eventos
      if (data.achievements.length > 0) {
        this.knownAchievements = new Set(data.achievements);
        
        useRewardsStore.setState((state) => {
          // Sincronizar array de IDs (para UI de logros)
          state.achievements = data.achievements;
          
          // Sincronizar ownedStickers (para que AchievementManager no los 're-desbloquee')
          data.achievements.forEach(id => {
            if (!state.ownedStickers[id]) {
              state.ownedStickers[id] = { normal: 1, shiny: 0 };
            }
          });
        });
      }

      if (data.accessibilityConfig) {
        useConfigStore.setState({ accessibility: data.accessibilityConfig });
      }

      // Guardar en cache de hidratación
      HydrationCache.save(this.patientId, {
        coins: data.coins,
        completedWays: data.completedWays,
        avatar: usePlayerStore.getState().profile?.avatar ?? '',
        name: usePlayerStore.getState().profile?.name ?? '',
        currentLevel: data.currentLevel
      });

    } catch (e) {
      console.error('[SyncEngine] Pull inicial fallido:', e);
    } finally {
      this.isPulling = false;
    }
  }

  private subscribeToStores() {
    this.unsubscribePlayer = usePlayerStore.subscribe((state, prevState) => {
      if (!this.patientId || this.isPulling) return;
      if (state.profile?.completedWays !== prevState.profile?.completedWays) {
        this.debouncedPush();
      }
    });

    this.unsubscribeRewards = useRewardsStore.subscribe((state, prevState) => {
      if (!this.patientId || this.isPulling) return;
      
      const coinsChanged = state.wayCoins !== prevState.wayCoins;
      const achievementsChanged = state.achievements !== prevState.achievements;
      
      if (coinsChanged || achievementsChanged) {
        this.debouncedPush();
      }
    });
  }

  private debouncedPush() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.push(), SYNC_DEBOUNCE_MS);
  }

  private async push() {
    if (this.circuitOpen || !this.patientId || this.isPulling || this.isPushing) return;

    this.isPushing = true;
    const player = usePlayerStore.getState();
    const rewards = useRewardsStore.getState();

    // Detectar achievements nuevos (que no están en nuestro Set local)
    const currentAchIds = (rewards.achievements ?? []).map(a => typeof a === 'string' ? a : (a as any).id);
    const newAchievements = currentAchIds.filter(id => !this.knownAchievements.has(id));

    const syncData: PatientSyncData = {
      patientId: this.patientId,
      coins: rewards.wayCoins,
      inventory: (rewards.inventory || []).map(i => i.id),
      equippedAvatarId: rewards.currentAvatar?.base || null,
      completedWays: player.profile?.completedWays || [],
      currentLevel: player.profile?.currentLevel || 'pregamer',
      accessibilityConfig: useConfigStore.getState().accessibility,
      performanceConfig: useConfigStore.getState().performance,
    };

    try {
      // 1. Push de Perfil (Upsert)
      const pushProfile = syncService.pushProgress(syncData);

      // 2. Push de Logros Nuevos (Parallel Inserts)
      const pushAchievements = newAchievements.map(id =>
        syncService.pushAchievement(this.patientId!, id).then(() => {
          this.knownAchievements.add(id);
        })
      );

      await Promise.all([pushProfile, ...pushAchievements]);

      // 3. Actualizar Cache
      HydrationCache.save(this.patientId, {
        coins: rewards.wayCoins,
        completedWays: player.profile?.completedWays || [],
        avatar: player.profile?.avatar ?? '',
        name: player.profile?.name ?? '',
        currentLevel: player.profile?.currentLevel ?? 'pregamer'
      });
      
      this.consecutiveErrors = 0; // Éxito: Resetear contador
    } catch (e) {
      this.consecutiveErrors++;
      console.error('[SyncEngine] Push fallido:', e);

      if (this.consecutiveErrors >= 3) {
        this.circuitOpen = true;
        console.warn('[SyncEngine] Circuit breaker abierto (30s)');
        setTimeout(() => {
          this.circuitOpen = false;
          this.consecutiveErrors = 0;
          console.log('[SyncEngine] Circuit breaker cerrado');
        }, 30000);
      }
    } finally {
      this.isPushing = false;
    }
  }

  private setupUnloadGuard() {
    const saveState = () => {
      if (!this.patientId) return;
      const player = usePlayerStore.getState();
      const rewards = useRewardsStore.getState();
      
      sessionStorage.setItem('way-emergency-state', JSON.stringify({
        patientId: this.patientId,
        completedWays: player.profile?.completedWays || [],
        coins: rewards.wayCoins,
        achievements: rewards.achievements,
        timestamp: Date.now(),
      }));
    };

    window.addEventListener('beforeunload', saveState);
    
    // Recuperar si existe y es reciente (< 5 minutos)
    const emergency = sessionStorage.getItem('way-emergency-state');
    if (emergency) {
      try {
        const parsed = JSON.parse(emergency);
        const age = Date.now() - parsed.timestamp;
        if (age < 300000 && parsed.patientId === this.patientId) {
          console.log('[SyncEngine] Recuperando estado de emergencia (paracaídas)');
          const current = usePlayerStore.getState();
          const mergedWays = [...new Set([...(current.profile?.completedWays || []), ...parsed.completedWays])];
          
          usePlayerStore.getState().syncFromCloud({
            patientId: parsed.patientId,
            completedWays: mergedWays,
          });
          
          useRewardsStore.setState(state => ({
            wayCoins: Math.max(state.wayCoins, parsed.coins),
          }));
        }
      } catch (e) {
        console.error('[SyncEngine] Error al parsear estado de emergencia:', e);
      }
      sessionStorage.removeItem('way-emergency-state');
    }

    return () => window.removeEventListener('beforeunload', saveState);
  }
}

export const syncEngine = new SyncEngine();
