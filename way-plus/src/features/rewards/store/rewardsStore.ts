import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { SHOP_CATALOG } from "../data/shopCatalog";
import { BOOSTS_CATALOG } from "../data/boosts";
import { MISSIONS_CATALOG, getTodayKey } from "../data/missions";
import { STICKERS_CATALOG } from "../data/collections";
import { eventBus } from "@/core/utils/eventBus";

// ─── Tipos ───────────────────────────────────────────────────────────────────
export type AvatarPart = string;

export interface RewardItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  equipped?: boolean;
}

interface RewardsState {
  wayCoins: number;
  totalXp: number;
  currentAvatar: Record<string, AvatarPart>;
  previewAvatar: Record<string, AvatarPart>;
  inventory: RewardItem[];
  purchaseHistory: string[];
  streakDays: number;
  lastActiveDate: string | null;
  achievements: string[];
  ownedStickers: Record<string, { normal: number; shiny: number }>;
  newCardAwarded: { id: string; isShiny: boolean } | null;
  unlockedSecrets: string[];
  newSecretAwarded: string | null;
  lastDailyChestOpened: string | null;
  lastStreakBonusDate: string | null;
  ownedBoosts: Record<string, number>;
  missionProgress: Record<string, number>;
  claimedMissions: string[];
  lastMissionReset: { daily: string; weekly: string };

  addCoins: (amount: number, source: string) => void;
  spendCoins: (amount: number) => boolean;
  unlockItem: (item: RewardItem) => void;
  equipPart: (slot: string, partId: AvatarPart) => void;
  purchaseItem: (itemId: AvatarPart) => { success: boolean; message: string };
  checkAndUpdateStreak: () => void;
  awardAchievement: (id: string) => void;
  unlockSticker: (stickerId: string, forceShiny?: boolean) => void;
  clearNewCardCelebration: () => void;
  celebrateCompletion: (type: "way" | "annex" | "step") => void;
  claimDailyReward: (reward: any) => void;
  updateMissionProgress: (category: string, amount: number) => void;
  claimMissionReward: (missionId: string) => void;
  checkMissionResets: () => void;
  unlockSecret: (secretId: string) => void;
  clearSecretCelebration: () => void;
  isPurchased: (itemId: string) => boolean;
  exchangeDuplicates: (count: number, type: 'random' | 'shiny') => { success: boolean; message: string };
  purchaseBoost: (boostId: string) => void;
  consumeBoost: (boostId: string) => void;
}

const DEFAULT_AVATAR = {
  base: "base-unicorn",
  hat: "hat-none",
  cape: "cape-none",
  shoes: "shoes-normal",
  background: "background-clouds",
  pet: "pet-none",
};

export const useRewardsStore = create<RewardsState>()(
  persist(
    immer((set, get) => ({
      wayCoins: 500,
      totalXp: 0,
      currentAvatar: DEFAULT_AVATAR,
      previewAvatar: DEFAULT_AVATAR,
      inventory: [{ id: "base-unicorn", name: "Unicornio", icon: "🦄", category: "base", rarity: "common", equipped: true }],
      purchaseHistory: ["base-unicorn"],
      streakDays: 0,
      lastActiveDate: null,
      achievements: [],
      newCardAwarded: null,
      lastDailyChestOpened: null,
      lastStreakBonusDate: null,
      ownedBoosts: {},
      missionProgress: {},
      claimedMissions: [],
      lastMissionReset: { daily: "", weekly: "" },
      ownedStickers: {},
      unlockedSecrets: [],
      newSecretAwarded: null,

      addCoins: (amount, source) =>
        set((state) => {
          state.wayCoins += amount;
          state.totalXp += Math.floor(amount / 2);
        }),

      spendCoins: (amount) => {
        if (get().wayCoins < amount) return false;
        set((state) => { state.wayCoins -= amount; });
        return true;
      },

      unlockItem: (item) =>
        set((state) => {
          if (!state.inventory.find((i) => i.id === item.id)) {
            state.inventory.push({ ...item, unlockedAt: new Date().toISOString() });
          }
        }),

      equipPart: (slot, partId) =>
        set((state) => {
          state.currentAvatar[slot] = partId;
          state.inventory.forEach((item) => {
            if (item.category === slot) item.equipped = item.id === partId;
          });
        }),

      purchaseItem: (itemId) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item || get().wayCoins < item.price) return { success: false, message: "Fallo" };
        set((draft) => {
          draft.wayCoins -= item.price;
          draft.purchaseHistory.push(itemId);
          draft.inventory.push({ id: item.id, name: item.name, icon: item.icon, category: item.category, rarity: item.rarity, unlockedAt: new Date().toISOString(), equipped: false });
        });
        return { success: true, message: "Ok" };
      },

      checkAndUpdateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        if (get().lastActiveDate === today) return;
        set((state) => {
          state.streakDays = (state.lastActiveDate === new Date(Date.now() - 86400000).toISOString().split("T")[0]) ? state.streakDays + 1 : 1;
          state.lastActiveDate = today;
        });
      },

      awardAchievement: (achievementId) => {
        if (get().achievements.includes(achievementId)) return;
        set((state) => {
          state.achievements.push(achievementId);
          state.wayCoins += 20;
        });
      },

      unlockSticker: (stickerId, forceShiny = false) =>
        set((state) => {
          if (!state.ownedStickers[stickerId]) state.ownedStickers[stickerId] = { normal: 0, shiny: 0 };
          const isShiny = forceShiny || Math.random() < 0.05;
          if (isShiny) state.ownedStickers[stickerId].shiny++;
          else state.ownedStickers[stickerId].normal++;
          state.newCardAwarded = { id: stickerId, isShiny };
        }),

      clearNewCardCelebration: () => set((state) => { state.newCardAwarded = null; }),
      celebrateCompletion: (type) => get().addCoins(type === "way" ? 10 : 25, type),
      claimDailyReward: (reward) => set((state) => {
        state.lastDailyChestOpened = new Date().toISOString();
        if (reward.type === "coins") state.wayCoins += reward.amount;
      }),
      updateMissionProgress: (category, amount) => set((state) => {
        MISSIONS_CATALOG.filter(m => m.category === category).forEach(m => {
          if (!state.claimedMissions.includes(m.id)) state.missionProgress[m.id] = (state.missionProgress[m.id] || 0) + amount;
        });
      }),
      claimMissionReward: (missionId) => set((state) => {
        const m = MISSIONS_CATALOG.find(m => m.id === missionId);
        if (m && !state.claimedMissions.includes(missionId)) {
          state.wayCoins += m.rewardCoins;
          state.claimedMissions.push(missionId);
        }
      }),
      checkMissionResets: () => set((state) => {
        const today = getTodayKey();
        if (state.lastMissionReset.daily !== today) {
          state.lastMissionReset.daily = today;
          MISSIONS_CATALOG.filter(m => m.type === "daily").forEach(m => {
            state.missionProgress[m.id] = 0;
            state.claimedMissions = state.claimedMissions.filter(id => id !== m.id);
          });
        }
      }),
      unlockSecret: (secretId) => set((state) => {
        if (state.unlockedSecrets.includes(secretId)) return;
        state.unlockedSecrets.push(secretId);
        state.newSecretAwarded = secretId;
      }),
      clearSecretCelebration: () => set((state) => { state.newSecretAwarded = null; }),
      isPurchased: (itemId) => get().purchaseHistory.includes(itemId),
      exchangeDuplicates: (count, type) => {
        set((state) => { 
          state.wayCoins += count * (type === 'shiny' ? 20 : 5);
        });
        return { success: true, message: `¡Canjeados ${count} repetidos por nuevas aventuras!` };
      },
      purchaseBoost: (boostId) => {
        const boost = BOOSTS_CATALOG.find(b => b.id === boostId);
        if (boost && get().wayCoins >= boost.price) {
          set((state) => {
            state.wayCoins -= boost.price;
            state.ownedBoosts[boostId] = (state.ownedBoosts[boostId] || 0) + 1;
          });
        }
      },
      consumeBoost: (boostId) => set((state) => {
        if (state.ownedBoosts[boostId] > 0) state.ownedBoosts[boostId]--;
      })
    })),
    {
      name: "way-rewards-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const patientId = sessionStorage.getItem("way-active-patient") || "guest";
          const str = localStorage.getItem(`${name}-${patientId}`);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          const patientId = sessionStorage.getItem("way-active-patient") || "guest";
          localStorage.setItem(`${name}-${patientId}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          const patientId = sessionStorage.getItem("way-active-patient") || "guest";
          localStorage.removeItem(`${name}-${patientId}`);
        },
      })),
    },
  ),
);

eventBus.on("WAY_COMPLETED", ({ isFirstTime }) => {
  const store = useRewardsStore.getState();
  if (isFirstTime) store.updateMissionProgress("complete_ways", 1);
  store.celebrateCompletion("way");
});
eventBus.on("DAILY_CHALLENGE_COMPLETED", () => { useRewardsStore.getState().celebrateCompletion("annex"); });
eventBus.on("TUTORIAL_COMPLETED", () => { useRewardsStore.getState().awardAchievement("tutorial_complete"); });
