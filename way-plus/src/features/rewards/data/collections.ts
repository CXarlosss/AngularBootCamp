export interface Sticker {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CollectionSet {
  id: string;
  name: string;
  description: string;
  stickerIds: string[];
  bonus: {
    type: 'coin_multiplier' | 'exclusive_item' | 'aura' | 'pet_evolution';
    value: string | number;
    description: string;
  };
}

export const STICKERS_CATALOG: Sticker[] = [
  // Set Emociones (8)
  { id: 'card-emo-1', name: 'Calma Infinita', icon: '🧘', description: 'La paz reside en tu respiración.', rarity: 'common' },
  { id: 'card-emo-2', name: 'Fuerza Interior', icon: '💪', description: 'Eres más fuerte de lo que crees.', rarity: 'common' },
  { id: 'card-emo-3', name: 'Alegría Radiante', icon: '☀️', description: 'Tu sonrisa ilumina el camino.', rarity: 'common' },
  { id: 'card-emo-4', name: 'Valentía León', icon: '🦁', description: 'El miedo no te detiene.', rarity: 'rare' },
  { id: 'card-emo-5', name: 'Mente Clara', icon: '🧠', description: 'Enfocado y listo para todo.', rarity: 'rare' },
  { id: 'card-emo-6', name: 'Corazón Valiente', icon: '🛡️', description: 'Proteges lo que amas.', rarity: 'epic' },
  { id: 'card-emo-7', name: 'Sabiduría Búho', icon: '🦉', description: 'Aprendes de cada paso.', rarity: 'epic' },
  { id: 'card-emo-8', name: 'Guardián Zen', icon: '⛩️', description: 'Maestro de tus propias emociones.', rarity: 'legendary' },

  // Set Criaturas (8)
  { id: 'card-cri-1', name: 'Dragón Chispita', icon: '🐲', description: 'Pequeño pero ardiente.', rarity: 'common' },
  { id: 'card-cri-2', name: 'Unicornio Estelar', icon: '🦄', description: 'Magia en cada galope.', rarity: 'common' },
  { id: 'card-cri-3', name: 'Fénix Renacido', icon: '🔥', description: 'Siempre vuelves a brillar.', rarity: 'rare' },
  { id: 'card-cri-4', name: 'Grifo Veloz', icon: '🦅', description: 'Rapidez y precisión.', rarity: 'rare' },
  { id: 'card-cri-5', name: 'Gato Cósmico', icon: '🐱', description: 'Ve a través de las dimensiones.', rarity: 'epic' },
  { id: 'card-cri-6', name: 'Lobo Lunar', icon: '🐺', description: 'Fiel a su manada.', rarity: 'epic' },
  { id: 'card-cri-7', name: 'Tortuga Sabia', icon: '🐢', description: 'Paso a paso se llega lejos.', rarity: 'legendary' },
  { id: 'card-cri-8', name: 'Serpiente de Luz', icon: '🐍', description: 'Sabiduría ancestral.', rarity: 'legendary' },
];

export const COLLECTIONS: CollectionSet[] = [
  {
    id: 'set-emotions',
    name: 'Guardianes del Corazón',
    description: 'Domina tus emociones para desbloquear el Aura Dorada.',
    stickerIds: ['card-emo-1', 'card-emo-2', 'card-emo-3', 'card-emo-4', 'card-emo-5', 'card-emo-6', 'card-emo-7', 'card-emo-8'],
    bonus: {
      type: 'aura',
      value: 'golden-glow',
      description: 'Aura Dorada para tu avatar'
    }
  },
  {
    id: 'set-creatures',
    name: 'Criaturas Mágicas',
    description: 'Colecciona todos los seres para obtener un +20% de monedas.',
    stickerIds: ['card-cri-1', 'card-cri-2', 'card-cri-3', 'card-cri-4', 'card-cri-5', 'card-cri-6', 'card-cri-7', 'card-cri-8'],
    bonus: {
      type: 'coin_multiplier',
      value: 1.2,
      description: '+20% Monedas Permanentes'
    }
  }
];
