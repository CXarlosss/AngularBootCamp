import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEngine } from './SyncEngine';
import { syncService } from '@/core/services/syncService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { HydrationCache } from './HydrationCache';

const PATIENT_ID = 'test-patient-1';

function setActivePatient(id = PATIENT_ID) {
  sessionStorage.setItem('way-active-patient', id);
}

function mockPullSuccess(overrides = {}) {
  vi.mocked(syncService.pullProgress).mockResolvedValue({
    name: 'Pedro', avatar: 'unicorn', completedWays: [],
    currentLevel: 'pregamer', coins: 0, achievements: [],
    accessibilityConfig: null,
    performanceConfig: null,
    updatedAt: new Date(Date.now() - 10_000).toISOString(),
    ...overrides,
  });
}

function mockPullFailure() {
  vi.mocked(syncService.pullProgress).mockRejectedValue(new Error('Network error'));
}

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    engine = new SyncEngine();
    vi.mocked(syncService.pushProgress).mockResolvedValue(undefined);
    vi.mocked(syncService.pushAchievement).mockResolvedValue(undefined);
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  // BLOQUE 1: start()
  describe('start() — resolución del patientId', () => {

    it('no arranca si no hay patientId tras el timeout (3s)', async () => {
      vi.useFakeTimers();
      const startPromise = engine.start();
      vi.advanceTimersByTime(3100);
      await startPromise;
      expect(syncService.pullProgress).not.toHaveBeenCalled();
    });

    it('FIX 1 — espera activamente hasta que el patientId aparece', async () => {
      vi.useFakeTimers();
      mockPullSuccess();
      const startPromise = engine.start();
      expect(sessionStorage.getItem('way-active-patient')).toBeNull();
      vi.advanceTimersByTime(200);
      setActivePatient();
      vi.advanceTimersByTime(150);
      await startPromise;
      expect(syncService.pullProgress).toHaveBeenCalledWith(PATIENT_ID);
    });

    it('detecta el patientId inmediatamente si ya existe', async () => {
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      expect(syncService.pullProgress).toHaveBeenCalledOnce();
    });
  });

  // BLOQUE 2: Circuit breaker
  describe('Circuit breaker', () => {

    beforeEach(() => {
      setActivePatient();
      mockPullSuccess();
      vi.mocked(syncService.pushProgress).mockRejectedValue(new Error('Supabase 500'));
    });

    it('FIX 2 — abre el circuit tras 3 errores consecutivos', async () => {
      await engine.start();
      for (let i = 0; i < 3; i++) await engine['push']();
      expect(engine.getStatus().status).toBe('circuit_open');
      expect(engine.getStatus().consecutiveErrors).toBe(3);
    });

    it('FIX 2 — el circuit se resetea automáticamente cuando expira el tiempo', async () => {
      vi.useFakeTimers();
      const now = Date.now();
      await engine.start();
      for (let i = 0; i < 3; i++) await engine['push']();
      expect(engine.getStatus().status).toBe('circuit_open');
      vi.setSystemTime(now + 40_000);
      expect(engine.getStatus().status).not.toBe('circuit_open');
      expect(engine.getStatus().consecutiveErrors).toBe(0);
      expect(engine.getStatus().circuitPausedUntil).toBeNull();
    });

    it('no hace push mientras el circuit está abierto', async () => {
      await engine.start();
      for (let i = 0; i < 3; i++) await engine['push']();
      vi.clearAllMocks();
      await engine['push']();
      expect(syncService.pushProgress).not.toHaveBeenCalled();
    });

    it('el contador se resetea tras un push exitoso', async () => {
      vi.mocked(syncService.pushProgress)
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(undefined);
      await engine.start();
      await engine['push']();
      await engine['push']();
      expect(engine.getStatus().consecutiveErrors).toBe(2);
      await engine['push']();
      expect(engine.getStatus().consecutiveErrors).toBe(0);
      expect(engine.getStatus().status).toBe('idle');
    });
  });

  // BLOQUE 3: Merge por timestamp
  describe('FIX 3 — Merge por timestamp en initialPull', () => {

    it('usa datos de Supabase si son más recientes que la caché', async () => {
      setActivePatient();
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() - 60_000);
      HydrationCache.save(PATIENT_ID, {
        coins: 10, completedWays: ['way-1'], avatar: 'unicorn',
        name: 'Pedro', currentLevel: 'pregamer',
      });
      vi.useRealTimers();
      mockPullSuccess({ coins: 50, completedWays: ['way-1', 'way-2'], updatedAt: new Date().toISOString() });
      await engine.start();
      expect(useRewardsStore.getState().wayCoins).toBe(50);
    });

    it('FIX 3 — conserva datos locales y hace push si la caché es más reciente', async () => {
      setActivePatient();
      HydrationCache.save(PATIENT_ID, {
        coins: 100, completedWays: ['way-1', 'way-2', 'way-3'],
        avatar: 'unicorn', name: 'Pedro', currentLevel: 'pregamer',
      });
      mockPullSuccess({ coins: 10, completedWays: ['way-1'], updatedAt: new Date(Date.now() - 10_000).toISOString() });
      vi.mocked(syncService.pushProgress).mockResolvedValue(undefined);
      await engine.start();
      expect(syncService.pushProgress).toHaveBeenCalled();
    });

    it('no hace push extra si Supabase ya tiene los datos más recientes', async () => {
      setActivePatient();
      mockPullSuccess({ coins: 30, updatedAt: new Date().toISOString() });
      await engine.start();
      expect(syncService.pushProgress).not.toHaveBeenCalled();
    });
  });

  // BLOQUE 4: Paracaídas beforeunload
  describe('FIX 4 — Paracaídas de emergencia', () => {

    it('guarda el estado en sessionStorage al dispararse beforeunload', async () => {
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      useRewardsStore.setState({ wayCoins: 42 });
      window.dispatchEvent(new Event('beforeunload'));
      const saved = JSON.parse(sessionStorage.getItem('way-emergency-state')!);
      expect(saved.patientId).toBe(PATIENT_ID);
      expect(saved.coins).toBe(42);
      expect(saved.timestamp).toBeCloseTo(Date.now(), -3);
    });

    it('FIX 4 — NO limpia el emergency state si el pull falla', async () => {
      setActivePatient();
      sessionStorage.setItem('way-emergency-state',
        JSON.stringify({ patientId: PATIENT_ID, coins: 99, timestamp: Date.now() }));
      mockPullFailure();
      await engine.start();
      expect(sessionStorage.getItem('way-emergency-state')).not.toBeNull();
    });

    it('FIX 4 — limpia el emergency state SOLO tras pull exitoso', async () => {
      setActivePatient();
      sessionStorage.setItem('way-emergency-state',
        JSON.stringify({ patientId: PATIENT_ID, coins: 99, timestamp: Date.now() }));
      mockPullSuccess();
      await engine.start();
      expect(sessionStorage.getItem('way-emergency-state')).toBeNull();
    });

    it('deja de escuchar beforeunload después de stop()', async () => {
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      engine.stop();
      window.dispatchEvent(new Event('beforeunload'));
      expect(sessionStorage.getItem('way-emergency-state')).toBeNull();
    });
  });

  // BLOQUE 5: HydrationCache
  describe('HydrationCache', () => {

    it('guarda y recupera el estado correctamente', () => {
      HydrationCache.save(PATIENT_ID, {
        coins: 55, completedWays: ['way-1'], avatar: 'dragon',
        name: 'Daniel', currentLevel: 'pregamer',
      });
      const loaded = HydrationCache.load(PATIENT_ID);
      expect(loaded?.coins).toBe(55);
      expect(loaded?.completedWays).toEqual(['way-1']);
    });

    it('ignora caché antigua (>30 min)', () => {
      vi.useFakeTimers();
      HydrationCache.save(PATIENT_ID, {
        coins: 10, completedWays: [], avatar: 'unicorn',
        name: 'Pedro', currentLevel: 'pregamer',
      });
      vi.advanceTimersByTime(31 * 60 * 1000);
      expect(HydrationCache.load(PATIENT_ID)).toBeNull();
    });

    it('loadWithTimestamp devuelve ts correcto', () => {
      const before = Date.now();
      HydrationCache.save(PATIENT_ID, {
        coins: 20, completedWays: [], avatar: 'unicorn',
        name: 'Pedro', currentLevel: 'pregamer',
      });
      const result = HydrationCache.loadWithTimestamp(PATIENT_ID);
      expect(result).not.toBeNull();
      if (result && result.state) {
        expect(result.ts).toBeGreaterThanOrEqual(before);
        expect(result.state.coins).toBe(20);
      }
    });
  });

  // BLOQUE 6: getStatus() y stop()
  describe('getStatus() y stop()', () => {

    it('actualiza lastSyncAt tras un push exitoso', async () => {
      const before = Date.now();
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      vi.mocked(syncService.pushProgress).mockResolvedValue(undefined);
      await engine['push']();
      expect(engine.getStatus().lastSyncAt).toBeGreaterThanOrEqual(before);
    });

    it('cancela el debounce pendiente al llamar stop()', async () => {
      vi.useFakeTimers();
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      usePlayerStore.setState((s: any) => { s.profile.completedWays = ['way-1']; });
      vi.advanceTimersByTime(1000);
      engine.stop();
      vi.advanceTimersByTime(2000);
      expect(syncService.pushProgress).not.toHaveBeenCalled();
    });

    it('limpia el patientId tras stop()', async () => {
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      engine.stop();
      expect(engine['patientId']).toBeNull();
    });

    it('los listeners de status se limpian tras stop()', async () => {
      setActivePatient();
      mockPullSuccess();
      await engine.start();
      const listener = vi.fn();
      engine.onStatusChange(listener);
      engine.stop();
      listener.mockClear();
      await engine['push']();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
