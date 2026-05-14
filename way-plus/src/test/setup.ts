import { vi, beforeEach, afterEach } from 'vitest';

// ─── sessionStorage mock ────────────────────────────────────────────────────
const sessionStorageStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem:    (k: string) => sessionStorageStore[k] ?? null,
  setItem:    (k: string, v: string) => { sessionStorageStore[k] = v; },
  removeItem: (k: string) => { delete sessionStorageStore[k]; },
  clear:      () => Object.keys(sessionStorageStore).forEach(k => delete sessionStorageStore[k]),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

// ─── Supabase mock ──────────────────────────────────────────────────────────
vi.mock('@/core/services/supabaseClient', () => ({
  isSupabaseAvailable: true,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// ─── syncService mock ───────────────────────────────────────────────────────
vi.mock('@/core/services/syncService', () => ({
  syncService: {
    pullProgress:    vi.fn(),
    pushProgress:    vi.fn().mockResolvedValue(undefined),
    pushAchievement: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Stores mock ────────────────────────────────────────────────────────────
let playerState = {
  profile: {
    id: 'test-patient-1',
    name: 'Pedro',
    avatar: 'unicorn',
    currentLevel: 'pregamer',
    completedWays: [] as string[],
    streakDays: 0,
  },
};
const playerListeners = new Set<(s: typeof playerState, p: typeof playerState) => void>();

export const usePlayerStoreMock = Object.assign(
  (selector?: (s: typeof playerState) => unknown) => selector ? selector(playerState) : playerState,
  {
    getState: () => ({
      ...playerState,
      syncFromCloud: vi.fn((data) => {
        playerState.profile = { ...playerState.profile, ...data };
      }),
    }),
    setState: (updater: any) => {
      const prev = { ...playerState, profile: { ...playerState.profile } };
      if (typeof updater === 'function') updater(playerState);
      else Object.assign(playerState, updater);
      playerListeners.forEach(l => l(playerState, prev));
    },
    subscribe: (fn: any) => {
      playerListeners.add(fn);
      return () => playerListeners.delete(fn);
    },
    _reset: () => {
      playerState = {
        profile: {
          id: 'test-patient-1',
          name: 'Pedro',
          avatar: 'unicorn',
          currentLevel: 'pregamer',
          completedWays: [],
          streakDays: 0,
        },
      };
      playerListeners.clear();
    },
  }
);

vi.mock('@/features/player/store/playerStore', () => ({
  usePlayerStore: usePlayerStoreMock
}));

let rewardsState = {
  wayCoins: 0,
  achievements: [] as string[],
  inventory: [] as { id: string }[],
  currentAvatar: null as { base: string } | null,
  ownedStickers: {} as Record<string, { normal: number; shiny: number }>,
};
const rewardsListeners = new Set<(s: typeof rewardsState, p: typeof rewardsState) => void>();

export const useRewardsStoreMock = Object.assign(
  (selector?: (s: typeof rewardsState) => unknown) => selector ? selector(rewardsState) : rewardsState,
  {
    getState: () => ({
      ...rewardsState,
      setCoins: vi.fn((c) => { rewardsState.wayCoins = c; }),
    }),
    setState: (updater: any) => {
      const prev = { ...rewardsState };
      if (typeof updater === 'function') updater(rewardsState);
      else Object.assign(rewardsState, updater);
      rewardsListeners.forEach(l => l(rewardsState, prev));
    },
    subscribe: (fn: any) => {
      rewardsListeners.add(fn);
      return () => rewardsListeners.delete(fn);
    },
    _reset: () => {
      rewardsState = { wayCoins: 0, achievements: [], inventory: [], currentAvatar: null, ownedStickers: {} };
      rewardsListeners.clear();
    },
  }
);

vi.mock('@/features/rewards/store/rewardsStore', () => ({
  useRewardsStore: useRewardsStoreMock
}));

vi.mock('@/core/stores/configStore', () => ({
  useConfigStore: {
    getState: vi.fn(() => ({ accessibility: { reduceMotion: false }, performance: {} })),
    setState: vi.fn(),
  },
}));

// ─── Limpieza entre tests ────────────────────────────────────────────────────
beforeEach(() => {
  sessionStorageMock.clear();
  vi.clearAllMocks();
  usePlayerStoreMock._reset();
  useRewardsStoreMock._reset();
});

afterEach(() => {
  vi.useRealTimers();
});
