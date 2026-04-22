import type { AvatarPart } from '../store/rewardsStore';

export interface ShopItem {
  id: AvatarPart;
  name: string;
  icon: string;
  category: 'base' | 'hat' | 'cape' | 'shoes' | 'background';
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requiredLevel?: number; // Desbloquea en nivel GAMER, PRO, etc.
}

export const SHOP_CATALOG: ShopItem[] = [
  // BASES (Desbloqueadas desde inicio o por nivel)
  { id: 'base-unicorn', name: 'Unicornio Arcoíris', icon: '🦄', category: 'base', price: 0, rarity: 'common' },
  { id: 'base-dragon', name: 'Dragón Fuego', icon: '🐉', category: 'base', price: 200, rarity: 'epic' },
  { id: 'base-puppy', name: 'Perrito Leal', icon: '🐶', category: 'base', price: 100, rarity: 'common' },
  { id: 'base-kitten', name: 'Gatito Mágico', icon: '🐱', category: 'base', price: 150, rarity: 'rare' },
  
  // SOMBREROS
  { id: 'hat-crown', name: 'Corona Real', icon: '👑', category: 'hat', price: 50, rarity: 'rare' },
  { id: 'hat-cap', name: 'Gorra Aventura', icon: '🧢', category: 'hat', price: 30, rarity: 'common' },
  { id: 'hat-bow', name: 'Lazo Brillante', icon: '🎀', category: 'hat', price: 40, rarity: 'common' },
  { id: 'hat-wizard', name: 'Sombrero Mago', icon: '🧙', category: 'hat', price: 120, rarity: 'epic' },
  { id: 'hat-party', name: 'Gorro Fiesta', icon: '🥳', category: 'hat', price: 60, rarity: 'rare' },
  
  // CAPAS
  { id: 'cape-super', name: 'Capa Súper Héroe', icon: '🦸', category: 'cape', price: 80, rarity: 'rare' },
  { id: 'cape-magic', name: 'Capa Mágica', icon: '✨', category: 'cape', price: 100, rarity: 'epic' },
  { id: 'cape-rainbow', name: 'Capa Arcoíris', icon: '🌈', category: 'cape', price: 70, rarity: 'rare' },
  
  // ZAPATOS
  { id: 'shoes-gold', name: 'Zapatos Dorados', icon: '👟', category: 'shoes', price: 45, rarity: 'rare' },
  { id: 'shoes-rainbow', name: 'Zapatos Arcoíris', icon: '🌈', category: 'shoes', price: 55, rarity: 'epic' },
  { id: 'shoes-rocket', name: 'Botas Cohete', icon: '🚀', category: 'shoes', price: 90, rarity: 'legendary' },
  
  // FONDOS
  { id: 'background-clouds', name: 'Nubes Suaves', icon: '☁️', category: 'background', price: 0, rarity: 'common' },
  { id: 'background-space', name: 'Espacio Estelar', icon: '🌌', category: 'background', price: 150, rarity: 'epic' },
  { id: 'background-garden', name: 'Jardín Florido', icon: '🌸', category: 'background', price: 80, rarity: 'rare' },
  { id: 'background-castle', name: 'Castillo Mágico', icon: '🏰', category: 'background', price: 200, rarity: 'legendary' },
];
