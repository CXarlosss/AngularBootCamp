export interface Boost {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: 'extra_time' | 'extra_life' | 'hint' | 'easier' | 'double_coins';
  value: number;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'boost';
}

export const BOOSTS_CATALOG: Boost[] = [
  {
    id: 'boost-time',
    name: 'Reloj Mágico',
    description: '+15 segundos extra en retos de tiempo.',
    icon: '⏳',
    effect: 'extra_time',
    value: 15,
    price: 20,
    rarity: 'common',
    category: 'boost'
  },
  {
    id: 'boost-life',
    name: 'Corazón de Hierro',
    description: 'Te permite cometer un error sin fallar el reto.',
    icon: '❤️',
    effect: 'extra_life',
    value: 1,
    price: 35,
    rarity: 'rare',
    category: 'boost'
  },
  {
    id: 'boost-hint',
    name: 'Estrella Guía',
    description: 'Resalta la respuesta correcta durante 5 segundos.',
    icon: '⭐',
    effect: 'hint',
    value: 5,
    price: 15,
    rarity: 'common',
    category: 'boost'
  },
  {
    id: 'boost-easy',
    name: 'Burbuja de Calma',
    description: 'Reduce la velocidad y dificultad de los estímulos.',
    icon: '🫧',
    effect: 'easier',
    value: 0.7, // 70% de velocidad
    price: 45,
    rarity: 'epic',
    category: 'boost'
  },
  {
    id: 'boost-double',
    name: 'Moneda de la Suerte',
    description: '¡Gana el doble de monedas al terminar!',
    icon: '🪙',
    effect: 'double_coins',
    value: 2,
    price: 60,
    rarity: 'legendary',
    category: 'boost'
  }
];
