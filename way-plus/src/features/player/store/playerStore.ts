import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlayerProfile } from '@/core/engine/types';
import { eventBus } from '@/core/utils/eventBus';

export interface RelaxationEntry {
  completed: boolean;
  duration: number;
  posture: boolean;
  breathing: boolean;
  accompanied: boolean;
  location: 'room' | 'other';
}

interface PlayerState {
  profile: PlayerProfile;
  session: {
    activeWay: string | null;
    attempts: Record<string, number>;
    startTime: number | null;
  };
  relaxationLog: Record<string, RelaxationEntry>;
  weeklyCheck: Record<string, boolean>;
  roleplayLog: Record<string, string[]>;
  dailyChallenge: {
    wayId: string | null;
    date: string | null;
    completed: boolean;
  };
  setName: (name: string) => void;
  setAvatar: (avatarId: string) => void;
  completeWay: (wayId: string, attempts: number) => void;
  resetSession: () => void;
  logRelaxation: (date: string, data: RelaxationEntry) => void;
  toggleWeeklyCheck: (itemId: string, date: string) => void;
  logRoleplay: (date: string, wayId: string) => void;
  setDailyChallenge: (wayId: string) => void;
  completeDailyChallenge: () => void;
  completeTutorial: () => void;
  syncFromCloud: (data: Partial<PlayerProfile & { patientId?: string; name?: string; avatar?: string }>) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    immer((set) => ({
      profile: {
        id: '1',
        name: 'Gamer',
        avatar: 'unicorn',
        currentLevel: 'pregamer',
        completedWays: [],
        streakDays: 0,
        tutorialCompleted: false,
        sessionQueue: [],
      },
      session: {
        activeWay: null,
        attempts: {},
        startTime: null,
      },
      relaxationLog: {},
      weeklyCheck: {},
      roleplayLog: {},
      dailyChallenge: {
        wayId: null,
        date: null,
        completed: false
      },

      setName: (name) => set((state) => { state.profile.name = name; }),
      setAvatar: (avatarId) => set((state) => { state.profile.avatar = avatarId; }),

      completeWay: (wayId, attempts) =>
        set((state) => {
          if (!state.profile.completedWays) state.profile.completedWays = [];
          const safeCompleted = Array.isArray(state.profile.completedWays) ? state.profile.completedWays : [];
          const isFirstTime = !safeCompleted.includes(wayId);

          if (isFirstTime) {
            state.profile.completedWays = [...safeCompleted, wayId];
          }
          state.session.attempts[wayId] = attempts;

          if (attempts === 1) {
            state.profile.streakDays += 1;
          }

          // FIX: Usar queueMicrotask para emitir tras la mutación de Immer
          queueMicrotask(() => {
            eventBus.emit('WAY_COMPLETED', { wayId, attempts, isFirstTime });
          });

          if (state.dailyChallenge.wayId === wayId && !state.dailyChallenge.completed) {
            state.dailyChallenge.completed = true;
            queueMicrotask(() => {
              eventBus.emit('DAILY_CHALLENGE_COMPLETED', { wayId });
            });
          }
        }),

      resetSession: () => set((state) => {
        state.session = { activeWay: null, attempts: {}, startTime: Date.now() };
      }),

      logRelaxation: (date, data) => set((state) => { state.relaxationLog[date] = data; }),
      toggleWeeklyCheck: (itemId, date) => set((state) => {
        const key = `${itemId}-${date}`;
        state.weeklyCheck[key] = !state.weeklyCheck[key];
      }),
      logRoleplay: (date, wayId) => set((state) => {
        if (!state.roleplayLog[date]) state.roleplayLog[date] = [];
        if (!state.roleplayLog[date].includes(wayId)) state.roleplayLog[date].push(wayId);
      }),

      setDailyChallenge: (wayId) => set((state) => {
        state.dailyChallenge = {
          wayId,
          date: new Date().toISOString().split('T')[0],
          completed: false
        };
      }),

      completeDailyChallenge: () => set((state) => { state.dailyChallenge.completed = true; }),

      completeTutorial: () => set((state) => {
        state.profile.tutorialCompleted = true;
        queueMicrotask(() => {
          eventBus.emit('TUTORIAL_COMPLETED', {});
        });
      }),

      syncFromCloud: (data) => set((state) => {
        if (data.patientId) state.profile.id = data.patientId;
        if (data.name) state.profile.name = data.name;
        if (data.avatar) state.profile.avatar = data.avatar;
        if (data.gender) state.profile.gender = data.gender;
        if (data.completedWays) state.profile.completedWays = data.completedWays;
        if (data.currentLevel) state.profile.currentLevel = data.currentLevel;
        if (data.sessionQueue) state.profile.sessionQueue = data.sessionQueue ?? [];
      }),
    })),
    {
      name: 'way-player-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'guest';
          const str = localStorage.getItem(`${name}-${patientId}`);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'guest';
          localStorage.setItem(`${name}-${patientId}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          const patientId = sessionStorage.getItem('way-active-patient') || 'guest';
          localStorage.removeItem(`${name}-${patientId}`);
        }
      }))
    }
  )
);
