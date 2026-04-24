import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PlayerProfile } from '@/core/engine/types';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';

export interface RelaxationEntry {
  completed: boolean;
  duration: number; // minutos
  posture: boolean;
  breathing: boolean;
  accompanied: boolean;
  location: 'room' | 'other';
}

interface PlayerState {
  profile: PlayerProfile;
  session: {
    activeWay: string | null;
    attempts: Record<string, number>; // wayId -> intentos
    startTime: number | null;
  };
  
  // Anexos
  relaxationLog: Record<string, RelaxationEntry>;
  weeklyCheck: Record<string, boolean>;
  roleplayLog: Record<string, string[]>;

  // Desafío Diario
  dailyChallenge: {
    wayId: string | null;
    date: string | null;
    completed: boolean;
  };
  
  // Acciones
  setName: (name: string) => void;
  setAvatar: (avatarId: string) => void;
  completeWay: (wayId: string, attempts: number) => void;
  resetSession: () => void;
  
  // Acciones de Anexos
  logRelaxation: (date: string, data: RelaxationEntry) => void;
  toggleWeeklyCheck: (itemId: string, date: string) => void;
  logRoleplay: (date: string, wayId: string) => void;
  
  // Acciones de Desafío
  setDailyChallenge: (wayId: string) => void;
  completeDailyChallenge: () => void;
  
  completeTutorial: () => void;
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

      setName: (name) => 
        set((state) => {
          state.profile.name = name;
        }),
      setAvatar: (avatarId) =>
        set((state) => {
          state.profile.avatar = avatarId;
        }),
      completeWay: (wayId, attempts) =>
        set((state) => {
          if (!state.profile.completedWays) state.profile.completedWays = [];
          if (!state.profile.completedWays.includes(wayId)) {
            state.profile.completedWays.push(wayId);
          }
          state.session.attempts[wayId] = attempts;
          
          // Trigger mission progress
          useRewardsStore.getState().updateMissionProgress('complete_ways', 1);

          if (attempts === 1) {
            state.profile.streakDays += 1;
          }
        }),
      resetSession: () =>
        set((state) => {
          state.session = {
            activeWay: null,
            attempts: {},
            startTime: Date.now(),
          };
        }),
        
      logRelaxation: (date, data) =>
        set((state) => {
          state.relaxationLog[date] = data;
        }),
        
      toggleWeeklyCheck: (itemId, date) =>
        set((state) => {
          const key = `${itemId}-${date}`;
          state.weeklyCheck[key] = !state.weeklyCheck[key];
        }),
        
      logRoleplay: (date, wayId) =>
        set((state) => {
          if (!state.roleplayLog[date]) state.roleplayLog[date] = [];
          if (!(state.roleplayLog[date] || []).includes(wayId)) {
            state.roleplayLog[date].push(wayId);
          }
        }),

      setDailyChallenge: (wayId) =>
        set((state) => {
          state.dailyChallenge = {
            wayId,
            date: new Date().toISOString().split('T')[0],
            completed: false
          };
        }),

      completeDailyChallenge: () =>
        set((state) => {
          state.dailyChallenge.completed = true;
        }),

      completeTutorial: () =>
        set((state) => {
          state.profile.tutorialCompleted = true;
        }),
    })),
    {
      name: 'way-plus-storage',
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...persistedState };
        if (merged.profile) {
          merged.profile = {
            ...currentState.profile,
            ...merged.profile,
            completedWays: merged.profile.completedWays || []
          };
        }
        return merged;
      },
      storage: {
        getItem: (name) => {
          const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
          const str = localStorage.getItem(`${name}-${patientId}`);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
          localStorage.setItem(`${name}-${patientId}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          const patientId = localStorage.getItem('way-active-patient') || 'demo-1';
          localStorage.removeItem(`${name}-${patientId}`);
        }
      }
    }
  )
);
