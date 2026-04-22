import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SHOP_CATALOG } from '../data/shopCatalog';

export type AvatarPart = 
  | 'base-unicorn' | 'base-dragon' | 'base-puppy' | 'base-kitten'
  | 'hat-crown' | 'hat-cap' | 'hat-bow' | 'hat-none' | 'hat-wizard' | 'hat-party'
  | 'cape-super' | 'cape-magic' | 'cape-none' | 'cape-rainbow'
  | 'shoes-gold' | 'shoes-rainbow' | 'shoes-normal' | 'shoes-rocket'
  | 'background-clouds' | 'background-space' | 'background-garden' | 'background-castle';

export interface RewardItem {
  id: string;
  name: string;
  icon: string;
  category: 'base' | 'hat' | 'cape' | 'shoes' | 'background' | 'avatar-part' | 'sticker' | 'badge';
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
  };
  
  previewAvatar: {
    base: AvatarPart;
    hat: AvatarPart;
    cape: AvatarPart;
    shoes: AvatarPart;
    background: AvatarPart;
  };
  
  // Inventario
  inventory: RewardItem[];
  purchaseHistory: string[];
  
  // Rachas
  streakDays: number;
  lastActiveDate: string | null;
  achievements: string[];
  
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
  celebrateCompletion: (type: 'way' | 'annex' | 'step') => void;
}

const DEFAULT_AVATAR: RewardsState['currentAvatar'] = {
  base: 'base-unicorn',
  hat: 'hat-none',
  cape: 'cape-none',
  shoes: 'shoes-normal',
  background: 'background-clouds',
};

const INITIAL_INVENTORY: RewardItem[] = [
  { id: 'base-unicorn', name: 'Unicornio', icon: '🦄', category: 'base', rarity: 'common', equipped: true },
  { id: 'shoes-normal', name: 'Zapatos', icon: '👟', category: 'shoes', rarity: 'common', equipped: true },
  { id: 'background-clouds', name: 'Nubes', icon: '☁️', category: 'background', rarity: 'common', equipped: true },
];

export const useRewardsStore = create<RewardsState>()(
  persist(
    immer((set, get) => ({
      wayCoins: 0,
      totalXp: 0,
      currentAvatar: DEFAULT_AVATAR,
      previewAvatar: DEFAULT_AVATAR,
      inventory: INITIAL_INVENTORY,
      purchaseHistory: ['base-unicorn', 'shoes-normal', 'background-clouds'],
      streakDays: 0,
      lastActiveDate: null,
      achievements: [],
      
      addCoins: (amount, source) =>
        set((state) => {
          state.wayCoins += amount;
          state.totalXp += amount;
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

      isPurchased: (itemId) => get().purchaseHistory.includes(itemId),
        
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
    })),
    { name: 'way-plus-rewards' }
  )
);
