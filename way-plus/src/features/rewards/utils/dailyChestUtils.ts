import { STICKERS_CATALOG } from '../data/collections';
import { SHOP_CATALOG } from '../data/shopCatalog';

export interface DailyReward {
  id: string;
  type: 'coins' | 'sticker' | 'item';
  name: string;
  amount?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export const REWARD_POOL: { weight: number; reward: DailyReward }[] = [
  { weight: 40, reward: { id: 'r1', type: 'coins', name: 'Puñado de Monedas', amount: 15, rarity: 'common', icon: '🪙' } },
  { weight: 25, reward: { id: 'r2', type: 'coins', name: 'Bolsa de Monedas', amount: 30, rarity: 'rare', icon: '💰' } },
  { weight: 15, reward: { id: 'r3', type: 'coins', name: 'Cofre de Monedas', amount: 50, rarity: 'epic', icon: '🏦' } },
  { weight: 10, reward: { id: 'r4', type: 'sticker', name: 'Cromo Aleatorio', rarity: 'rare', icon: '📔' } },
  { weight: 8, reward: { id: 'r5', type: 'item', name: 'Accesorio Sorpresa', rarity: 'epic', icon: '🎁' } },
  { weight: 2, reward: { id: 'r6', type: 'coins', name: '¡EL BOTÍN GORDO!', amount: 150, rarity: 'legendary', icon: '👑' } },
];

export const getRandomReward = (): DailyReward => {
  const totalWeight = REWARD_POOL.reduce((acc, r) => acc + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const entry of REWARD_POOL) {
    if (random < entry.weight) {
      // If it's a sticker or item, we need to pick a real one from the catalog
      if (entry.reward.type === 'sticker') {
        const randomSticker = STICKERS_CATALOG[Math.floor(Math.random() * STICKERS_CATALOG.length)];
        return {
          ...entry.reward,
          id: randomSticker.id,
          name: randomSticker.name,
          icon: randomSticker.icon,
          rarity: randomSticker.rarity
        };
      }
      if (entry.reward.type === 'item') {
        const randomItem = SHOP_CATALOG[Math.floor(Math.random() * SHOP_CATALOG.length)];
        return {
          ...entry.reward,
          id: randomItem.id,
          name: randomItem.name,
          icon: randomItem.icon,
          rarity: randomItem.rarity
        };
      }
      return entry.reward;
    }
    random -= entry.weight;
  }
  return REWARD_POOL[0].reward;
};

export const isChestAvailable = (lastOpenedDate: string | null): boolean => {
  if (!lastOpenedDate) return true;
  const last = new Date(lastOpenedDate);
  const now = new Date();
  
  // Reset at midnight
  return (
    last.getDate() !== now.getDate() ||
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
};
