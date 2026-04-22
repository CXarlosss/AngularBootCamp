import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PlayerProfile } from '@/core/engine/types';

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
  
  // Acciones
  setName: (name: string) => void;
  setAvatar: (avatarId: string) => void;
  completeWay: (wayId: string, attempts: number) => void;
  resetSession: () => void;
  
  // Acciones de Anexos
  logRelaxation: (date: string, data: RelaxationEntry) => void;
  toggleWeeklyCheck: (itemId: string, date: string) => void;
  logRoleplay: (date: string, wayId: string) => void;
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
      },
      session: {
        activeWay: null,
        attempts: {},
        startTime: null,
      },
      
      relaxationLog: {},
      weeklyCheck: {},
      roleplayLog: {},

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
          if (!state.profile.completedWays.includes(wayId)) {
            state.profile.completedWays.push(wayId);
          }
          state.session.attempts[wayId] = attempts;
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
          if (!state.roleplayLog[date].includes(wayId)) {
            state.roleplayLog[date].push(wayId);
          }
        }),
    })),
    {
      name: 'way-plus-storage',
    }
  )
);
