import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import { MISSIONS_CATALOG, getTodayKey, getWeekNumber } from '../data/missions';
import { STICKERS_CATALOG } from '../data/collections';
import { SECRET_CARDS } from '../data/secrets';

export type AvatarPart = 
  | 'base-unicorn' | 'base-dragon' | 'base-puppy' | 'base-kitten' | 'base-fox' | 'base-panda' | 'base-robot' | 'base-alien' | 'base-bear' | 'base-monkey'
  | 'hat-crown' | 'hat-cap' | 'hat-bow' | 'hat-none' | 'hat-wizard' | 'hat-party' | 'hat-cat-ears' | 'hat-cowboy' | 'hat-graduation' | 'hat-santa' | 'hat-crown-gold' | 'hat-headphones' | 'hat-ribbon' | 'hat-astronaut'
  | 'cape-super' | 'cape-magic' | 'cape-none' | 'cape-rainbow' | 'cape-bat' | 'cape-angel' | 'cape-ninja' | 'cape-butterfly' | 'cape-invisible' | 'cape-royal'
  | 'shoes-gold' | 'shoes-rainbow' | 'shoes-normal' | 'shoes-rocket' | 'shoes-slippers' | 'shoes-sport' | 'shoes-roller' | 'shoes-boots' | 'shoes-magic' | 'shoes-ice'
  | 'background-clouds' | 'background-space' | 'background-garden' | 'background-castle' | 'background-beach' | 'background-mountains' | 'background-rainbow' | 'background-night' | 'background-underwater' | 'background-candy'
  | 'pet-none' | 'pet-bee' | 'pet-fish' | 'pet-bird' | 'pet-hamster' | 'pet-turtle' | 'pet-butterfly' | 'pet-dragon-baby';

export interface RewardItem {
  id: string;
  name: string;
  icon: string;
  category: 'base' | 'hat' | 'cape' | 'shoes' | 'background' | 'pet' | 'avatar-part' | 'sticker' | 'badge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  equipped?: boolean;
}

interface RewardsState {
  // Economía
  wayCoins: number;
  totalXp: number;
  
  // Progreso de avatar
  currentAvatar: {
    base: AvatarPart;
    hat: AvatarPart;
    cape: AvatarPart;
    shoes: AvatarPart;
    background: AvatarPart;
    pet: AvatarPart;
  };
  
  previewAvatar: {
    base: AvatarPart;
    hat: AvatarPart;
    cape: AvatarPart;
    shoes: AvatarPart;
    background: AvatarPart;
    pet: AvatarPart;
  };
  
  // Inventario
  inventory: RewardItem[];
  purchaseHistory: string[];
  
  // Rachas
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
  
  // Acciones
  addCoins: (amount: number, source: string) => void;
  spendCoins: (amount: number) => boolean;
  unlockItem: (item: RewardItem) => void;
  equipPart: (slot: keyof RewardsState['currentAvatar'], partId: AvatarPart) => void;
  previewItem: (slot: keyof RewardsState['currentAvatar'], partId: AvatarPart) => void;
  resetPreview: () => void;
  purchaseItem: (itemId: AvatarPart) => { success: boolean; message: string };
  isPurchased: (itemId: AvatarPart) => boolean;
  checkAndUpdateStreak: () => void;
  awardAchievement: (id: string) => void;
  unlockSticker: (stickerId: string, forceShiny?: boolean) => void;
  clearNewCardCelebration: () => void;
  celebrateCompletion: (type: 'way' | 'annex' | 'step') => void;
  claimDailyReward: (reward: any) => void;
  claimStreakBonus: (coins: number) => void;
  claimStreakMilestone: (milestone: any) => void;
  purchaseBoost: (boostId: string) => { success: boolean; message: string };
  consumeBoost: (boostId: string) => void;
  updateMissionProgress: (category: string, amount: number) => void;
  claimMissionReward: (missionId: string) => void;
  checkMissionResets: () => void;
  exchangeDuplicates: (count: number, targetType: 'random' | 'shiny') => { success: boolean; message: string };
  unlockSecret: (secretId: string) => void;
  clearSecretCelebration: () => void;
}

const DEFAULT_AVATAR: RewardsState['currentAvatar'] = {
  base: 'base-unicorn',
  hat: 'hat-none',
  cape: 'cape-none',
  shoes: 'shoes-normal',
  background: 'background-clouds',
  pet: 'pet-none',
};

const INITIAL_INVENTORY: RewardItem[] = [
  { id: 'base-unicorn', name: 'Unicornio', icon: '🦄', category: 'base', rarity: 'common', equipped: true },
  { id: 'shoes-normal', name: 'Zapatos', icon: '👟', category: 'shoes', rarity: 'common', equipped: true },
  { id: 'background-clouds', name: 'Nubes', icon: '☁️', category: 'background', rarity: 'common', equipped: true },
  { id: 'pet-dragon-baby', name: 'Bebé Dragón', icon: '🐲', category: 'pet', rarity: 'legendary', equipped: false },
];

export const useRewardsStore = create<RewardsState>()(
  persist(
    immer((set, get) => ({
      wayCoins: 500,
      totalXp: 0,
      currentAvatar: DEFAULT_AVATAR,
      previewAvatar: DEFAULT_AVATAR,
      inventory: INITIAL_INVENTORY,
      purchaseHistory: ['base-unicorn', 'shoes-normal', 'background-clouds', 'pet-dragon-baby'],
      streakDays: 0,
      lastActiveDate: null,
      achievements: [],
      newCardAwarded: null,
      lastDailyChestOpened: null,
      lastStreakBonusDate: null,
      ownedBoosts: {},
      missionProgress: {},
      claimedMissions: [],
      lastMissionReset: { daily: '', weekly: '' },
      ownedStickers: {},
      unlockedSecrets: [],
      newSecretAwarded: null,
      
      addCoins: (amount, source) =>
        set((state) => {
          state.wayCoins += amount;
          state.totalXp += Math.floor(amount / 2);
          state.updateMissionProgress('earn_coins', amount);
        }),
        
      spendCoins: (amount) => {
        const { wayCoins } = get();
        if (wayCoins < amount) return false;
        set((state) => { state.wayCoins -= amount; });
        return true;
      },
      
      unlockItem: (item) =>
        set((state) => {
          if (!state.inventory.find(i => i.id === item.id)) {
            state.inventory.push({ ...item, unlockedAt: new Date().toISOString() });
          }
        }),
        
      equipPart: (slot, partId) =>
        set((state) => {
          state.currentAvatar[slot] = partId;
          state.previewAvatar[slot] = partId; // Sincronizar preview
          state.inventory.forEach(item => {
            if (item.category === slot) {
              item.equipped = item.id === partId;
            }
          });
        }),

      previewItem: (slot, partId) =>
        set((state) => {
          state.previewAvatar[slot] = partId;
        }),

      resetPreview: () =>
        set((state) => {
          state.previewAvatar = { ...state.currentAvatar };
        }),

      purchaseItem: (itemId) => {
        const state = get();
        const item = SHOP_CATALOG.find(i => i.id === itemId);
        
        if (!item) return { success: false, message: 'Item no existe' };
        if (state.purchaseHistory.includes(itemId)) {
          return { success: false, message: 'Ya lo tienes' };
        }
        if (state.wayCoins < item.price) {
          return { success: false, message: 'Necesitas más monedas' };
        }
        
        set((draft) => {
          draft.wayCoins -= item.price;
          draft.purchaseHistory.push(itemId);
          draft.inventory.push({
            id: item.id,
            name: item.name,
            icon: item.icon,
            category: item.category,
            rarity: item.rarity,
            unlockedAt: new Date().toISOString(),
            equipped: false
          });
        });
        
        return { success: true, message: '¡Comprado!' };
      },

      isPurchased: (itemId) => (get().purchaseHistory || []).includes(itemId),
        
      checkAndUpdateStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const last = state.lastActiveDate;
          
          if (!last) {
            state.streakDays = 1;
          } else {
            const lastDate = new Date(last);
            const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              state.streakDays += 1;
            } else if (diffDays > 1) {
              state.streakDays = 1;
            }
          }
          state.lastActiveDate = today;
        }),
        
      awardAchievement: (id) =>
        set((state) => {
          if (!state.achievements.includes(id)) {
            state.achievements.push(id);
          }
        }),

      unlockSticker: (stickerId, forceShiny = false) => {
        set((state) => {
          if (!state.ownedStickers[stickerId]) {
            state.ownedStickers[stickerId] = { normal: 0, shiny: 0 };
          }
          
          const isShiny = forceShiny || Math.random() < 0.05; // 5% chance
          if (isShiny) {
            state.ownedStickers[stickerId].shiny++;
          } else {
            state.ownedStickers[stickerId].normal++;
          }
          
          state.newCardAwarded = { id: stickerId, isShiny };
        });
      },
        
      clearNewCardCelebration: () => set((state) => { state.newCardAwarded = null; }),
        
      celebrateCompletion: (type) => {
        const rewards = {
          way: { coins: 10, xp: 15 },
          annex: { coins: 25, xp: 30 },
          step: { coins: 100, xp: 100 },
        };
        const reward = rewards[type];
        get().addCoins(reward.coins, type);
        get().checkAndUpdateStreak();
      },

      claimDailyReward: (reward) => {
        set((state) => {
          state.lastDailyChestOpened = new Date().toISOString();
          
          if (reward.type === 'coins') {
            state.addCoins(reward.amount || 0, 'daily_chest');
          } else if (reward.type === 'sticker') {
            state.unlockSticker(reward.id);
          } else if (reward.type === 'item') {
            if (!state.inventory.find(i => i.id === reward.id)) {
              state.inventory.push({
                id: reward.id,
                name: reward.name,
                icon: reward.icon,
                category: 'avatar-part',
                rarity: reward.rarity,
                unlockedAt: new Date().toISOString(),
                equipped: false
              });
              state.purchaseHistory.push(reward.id);
            }
          }

          // Trigger mission progress for opening chests
          state.updateMissionProgress('open_chests', 1);
        });
      },

      purchaseBoost: (boostId) => {
        const state = get();
        const boost = BOOSTS_CATALOG.find(b => b.id === boostId);
        
        if (!boost) return { success: false, message: 'Boost no existe' };
        if (state.wayCoins < boost.price) {
          return { success: false, message: 'Necesitas más monedas' };
        }
        
        set((draft) => {
          draft.wayCoins -= boost.price;
          if (!draft.ownedBoosts[boostId]) {
            draft.ownedBoosts[boostId] = 0;
          }
          draft.ownedBoosts[boostId]++;
        });
        
        return { success: true, message: '¡Boost comprado!' };
      },

      consumeBoost: (boostId) => {
        set((state) => {
          if (state.ownedBoosts[boostId] > 0) {
            state.ownedBoosts[boostId]--;
          }
        });
      },

      updateMissionProgress: (category, amount) => {
        set((state) => {
          const relevantMissions = MISSIONS_CATALOG.filter((m) => m.category === category);
          
          relevantMissions.forEach((m) => {
            if (!state.claimedMissions.includes(m.id)) {
              const current = state.missionProgress[m.id] || 0;
              state.missionProgress[m.id] = current + amount;
            }
          });
        });
      },

      claimMissionReward: (missionId) => {
        set((state) => {
          const mission = MISSIONS_CATALOG.find((m) => m.id === missionId);
          if (mission && !state.claimedMissions.includes(missionId)) {
            state.wayCoins += mission.rewardCoins;
            state.totalXp += mission.rewardXp;
            state.claimedMissions.push(missionId);
          }
        });
      },

      checkMissionResets: () => {
        set((state) => {
          const today = getTodayKey();
          const week = getWeekNumber(new Date());
          
          if (state.lastMissionReset.daily !== today) {
            state.lastMissionReset.daily = today;
            // Reset daily progress
            MISSIONS_CATALOG.filter((m) => m.type === 'daily').forEach((m) => {
              state.missionProgress[m.id] = 0;
              state.claimedMissions = state.claimedMissions.filter(id => id !== m.id);
            });
          }
          
          if (state.lastMissionReset.weekly !== week) {
            state.lastMissionReset.weekly = week;
            // Reset weekly progress
            MISSIONS_CATALOG.filter((m) => m.type === 'weekly').forEach((m) => {
              state.missionProgress[m.id] = 0;
              state.claimedMissions = state.claimedMissions.filter(id => id !== m.id);
            });
          }
        });
      },

      claimStreakBonus: (coins) => {
        set((state) => {
          state.wayCoins += coins;
          state.totalXp += coins;
          state.lastStreakBonusDate = new Date().toISOString();
          
          // Trigger mission progress for streak days
          state.updateMissionProgress('streak_days', 1);
        });
      },

      claimStreakMilestone: (milestone) => {
        set((state) => {
          // Bonus de monedas y XP
          state.wayCoins += milestone.reward.coins;
          state.totalXp += milestone.reward.xp;

          // Item si existe
          if (milestone.reward.item) {
            const item = SHOP_CATALOG.find(i => i.id === milestone.reward.item);
            if (item && !state.purchaseHistory.includes(item.id as any)) {
              state.purchaseHistory.push(item.id as any);
              state.inventory.push({
                id: item.id,
                name: item.name,
                icon: item.icon,
                category: item.category,
                rarity: item.rarity,
                unlockedAt: new Date().toISOString(),
                equipped: false
              });
            }
          }

          // Cromo si existe
          if (milestone.reward.stickerId) {
            state.unlockSticker(milestone.reward.stickerId);
          }
        });
      },

      exchangeDuplicates: (count, targetType) => {
        const state = get();
        // Calculate total duplicates
        let totalDuplicates = 0;
        Object.values(state.ownedStickers).forEach(s => {
          if (s.normal > 1) totalDuplicates += (s.normal - 1);
          if (s.shiny > 1) totalDuplicates += (s.shiny - 1);
        });

        if (totalDuplicates < count) {
          return { success: false, message: 'No tienes suficientes duplicados' };
        }

        set((draft) => {
          // Remove duplicates (greedy approach)
          let remainingToRemove = count;
          Object.keys(draft.ownedStickers).forEach(id => {
            while (remainingToRemove > 0 && draft.ownedStickers[id].normal > 1) {
              draft.ownedStickers[id].normal--;
              remainingToRemove--;
            }
            while (remainingToRemove > 0 && draft.ownedStickers[id].shiny > 1) {
              draft.ownedStickers[id].shiny--;
              remainingToRemove--;
            }
          });

          // Award new card
          if (targetType === 'shiny') {
            const randomSticker = STICKERS_CATALOG[Math.floor(Math.random() * STICKERS_CATALOG.length)];
            draft.unlockSticker(randomSticker.id, true);
          } else {
            // Find a card user doesn't have
            const unowned = STICKERS_CATALOG.filter(s => !draft.ownedStickers[s.id]);
            const targetList = unowned.length > 0 ? unowned : STICKERS_CATALOG;
            const randomSticker = targetList[Math.floor(Math.random() * targetList.length)];
            draft.unlockSticker(randomSticker.id);
          }
        });

        return { success: true, message: '¡Canje realizado con éxito!' };
      },

      unlockSecret: (secretId) => {
        set((state) => {
          if (state.unlockedSecrets.includes(secretId)) return;
          
          const secret = SECRET_CARDS.find((s) => s.id === secretId);
          if (!secret) return;

          state.unlockedSecrets.push(secretId);
          state.newSecretAwarded = secretId;
          
          // Also unlock the actual sticker
          state.unlockSticker(secret.stickerId, true); // Secrets are ALWAYS shiny
        });
      },

      clearSecretCelebration: () => set((state) => { state.newSecretAwarded = null; })
    })),
    { 
      name: 'way-plus-rewards',
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...persistedState };
        return {
          ...merged,
          inventory: merged.inventory || currentState.inventory,
          collectedStickers: merged.collectedStickers || [],
          achievements: merged.achievements || [],
          purchaseHistory: merged.purchaseHistory || currentState.purchaseHistory,
        };
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
