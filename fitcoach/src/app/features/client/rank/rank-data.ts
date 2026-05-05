// src/app/features/client/rank/rank-data.ts

export interface RankTier {
  id: string;
  name: string;
  emoji: string;
  frameColor: string;
  frameGlow: string;
  quote: string;
  description: string;
  level: number;
}

export interface Division {
  label: string;
  roman: string;
  xpRequired: number;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'recruit',
    name: 'Recruta',
    emoji: '⚔️',
    frameColor: 'transparent',
    frameGlow: 'none',
    quote: 'Todo gran guerrero comienza con un primer paso.',
    description: 'Sin marco — avatar con opacidad reducida',
    level: 0,
  },
  {
    id: 'legionary',
    name: 'Legionario',
    emoji: '🛡️',
    frameColor: '#cd7f32',
    frameGlow: '0 0 20px rgba(205,127,50,0.3)',
    quote: 'La disciplina forja al guerrero.',
    description: 'Anillo bronce con glow suave',
    level: 1,
  },
  {
    id: 'centurion',
    name: 'Centurión',
    emoji: '🏛️',
    frameColor: '#c0c0c0',
    frameGlow: '0 0 25px rgba(192,192,192,0.35)',
    quote: 'Liderar es servir con el ejemplo.',
    description: 'Anillo plateado con resplandor',
    level: 2,
  },
  {
    id: 'tribune',
    name: 'Tribuno',
    emoji: '💎',
    frameColor: '#10b981',
    frameGlow: '0 0 30px rgba(16,185,129,0.35)',
    quote: 'El poder verdadero reside en la constancia.',
    description: 'Anillo verde brillante',
    level: 3,
  },
  {
    id: 'demigod',
    name: 'Semidiós',
    emoji: '👑',
    frameColor: '#fbbf24',
    frameGlow: '0 0 35px rgba(251,191,36,0.4)',
    quote: 'Estás a un paso de la leyenda.',
    description: 'Anillo dorado pulsante animado',
    level: 4,
  },
  {
    id: 'zeus',
    name: 'Zeus Eterno',
    emoji: '⚡',
    frameColor: '#dc2626',
    frameGlow: '0 0 40px rgba(220,38,38,0.45)',
    quote: 'Has alcanzado la cima del Olimpo.',
    description: 'Anillo rojo con efecto cónico rotante',
    level: 5,
  },
];

export const DIVISIONS: Division[] = [
  { label: 'IV',  roman: 'IV',  xpRequired: 0 },
  { label: 'III', roman: 'III', xpRequired: 500 },
  { label: 'II',  roman: 'II',  xpRequired: 1000 },
  { label: 'I',   roman: 'I',   xpRequired: 1500 },
];

// XP necesario para subir de rango completo (entre tiers)
export const TIER_XP_THRESHOLD = 2000;

export function getCurrentRankState(totalXp: number): {
  currentTier: RankTier;
  currentDivision: Division;
  nextTier: RankTier | null;
  nextDivision: Division | null;
  progressInTier: number;      // 0-1
  progressToNextDivision: number; // 0-1
  xpInCurrentTier: number;
  xpToNextTier: number;
  xpToNextDivision: number;
  totalXpForNextTier: number;
} {
  const tierIndex = Math.min(
    Math.floor(totalXp / TIER_XP_THRESHOLD),
    RANK_TIERS.length - 1
  );
  
  const currentTier = RANK_TIERS[tierIndex];
  const nextTier = RANK_TIERS[tierIndex + 1] ?? null;
  
  const xpInTier = totalXp % TIER_XP_THRESHOLD;
  
  // División actual dentro del tier
  let currentDivIndex = 0;
  for (let i = DIVISIONS.length - 1; i >= 0; i--) {
    if (xpInTier >= DIVISIONS[i].xpRequired) {
      currentDivIndex = i;
      break;
    }
  }
  
  const currentDivision = DIVISIONS[currentDivIndex];
  const nextDivision = DIVISIONS[currentDivIndex + 1] ?? null;
  
  const xpToNextDivision = nextDivision 
    ? nextDivision.xpRequired - xpInTier 
    : TIER_XP_THRESHOLD - xpInTier;
    
  const xpToNextTier = TIER_XP_THRESHOLD - xpInTier;
  const totalXpForNextTier = (tierIndex + 1) * TIER_XP_THRESHOLD;
  
  const progressInTier = xpInTier / TIER_XP_THRESHOLD;
  const progressToNextDivision = nextDivision
    ? (xpInTier - currentDivision.xpRequired) / (nextDivision.xpRequired - currentDivision.xpRequired)
    : 1;

  return {
    currentTier,
    currentDivision,
    nextTier,
    nextDivision,
    progressInTier,
    progressToNextDivision,
    xpInCurrentTier: xpInTier,
    xpToNextTier,
    xpToNextDivision,
    totalXpForNextTier,
  };
}
