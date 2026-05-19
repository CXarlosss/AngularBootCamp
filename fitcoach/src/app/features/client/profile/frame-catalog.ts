export interface Frame {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockXp?: number;       // XP requerido para desbloquear (undefined = disponible siempre)
  unlockRank?: string;     // Rango requerido (opcional)
  cssClass: string;        // Clase CSS que aplica el efecto visual
  previewGradient: string; // Gradiente para la previsualización en el selector
  category: 'basic' | 'neon' | 'premium' | 'elemental' | 'special';
}

export const FRAME_CATALOG: Frame[] = [
  // ── BASIC ──────────────────────────────────────────────────────────────────
  {
    id: 'none',
    name: 'Sin marco',
    description: 'Sin marco equipado',
    rarity: 'common',
    cssClass: 'frame-none',
    previewGradient: 'linear-gradient(135deg, #374151, #1f2937)',
    category: 'basic',
  },
  {
    id: 'silver',
    name: 'Plata',
    description: 'Marco clásico plateado con acabado metálico',
    rarity: 'common',
    cssClass: 'frame-silver',
    previewGradient: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #a8a8a8)',
    category: 'basic',
  },
  {
    id: 'bronze',
    name: 'Bronce',
    description: 'Marco bronce cálido para los primeros logros',
    rarity: 'common',
    unlockXp: 100,
    cssClass: 'frame-bronze',
    previewGradient: 'linear-gradient(135deg, #cd7f32, #e8a864, #a0522d)',
    category: 'basic',
  },

  // ── NEON ───────────────────────────────────────────────────────────────────
  {
    id: 'neon-cyan',
    name: 'Neón Cyan',
    description: 'Marco neón brillante con pulso eléctrico',
    rarity: 'uncommon',
    unlockXp: 500,
    cssClass: 'frame-neon-cyan',
    previewGradient: 'linear-gradient(135deg, #00f5ff, #0080ff, #00f5ff)',
    category: 'neon',
  },
  {
    id: 'neon-pink',
    name: 'Neón Rosa',
    description: 'Vibración rosa neón de alta energía',
    rarity: 'uncommon',
    unlockXp: 500,
    cssClass: 'frame-neon-pink',
    previewGradient: 'linear-gradient(135deg, #ff006e, #ff4da6, #ff006e)',
    category: 'neon',
  },
  {
    id: 'neon-green',
    name: 'Neón Verde',
    description: 'Marco verde eléctrico estilo matrix',
    rarity: 'uncommon',
    unlockXp: 750,
    cssClass: 'frame-neon-green',
    previewGradient: 'linear-gradient(135deg, #00ff41, #00cc33, #00ff41)',
    category: 'neon',
  },

  // ── PREMIUM ────────────────────────────────────────────────────────────────
  {
    id: 'gold',
    name: 'Dorado',
    description: 'Marco dorado premium con destellos de luz',
    rarity: 'rare',
    unlockXp: 1500,
    cssClass: 'frame-gold',
    previewGradient: 'linear-gradient(135deg, #ffd700, #ffec6e, #d4a900)',
    category: 'premium',
  },
  {
    id: 'crystal',
    name: 'Cristal',
    description: 'Marco de cristal translúcido con efecto prisma',
    rarity: 'rare',
    unlockXp: 2000,
    cssClass: 'frame-crystal',
    previewGradient: 'linear-gradient(135deg, rgba(200,230,255,0.8), rgba(255,255,255,0.9), rgba(180,220,255,0.7))',
    category: 'premium',
  },
  {
    id: 'diamond',
    name: 'Diamante',
    description: 'Marco de diamante con reflejos de arco iris',
    rarity: 'epic',
    unlockXp: 5000,
    unlockRank: 'Elite',
    cssClass: 'frame-diamond',
    previewGradient: 'linear-gradient(135deg, #b9f2ff, #ffffff, #e0f7ff, #c2e9fb)',
    category: 'premium',
  },

  // ── ELEMENTAL ──────────────────────────────────────────────────────────────
  {
    id: 'fire',
    name: 'Fuego',
    description: 'Llamas animadas que rodean tu perfil',
    rarity: 'epic',
    unlockXp: 3000,
    cssClass: 'frame-fire',
    previewGradient: 'linear-gradient(135deg, #ff4500, #ff8c00, #ffd700)',
    category: 'elemental',
  },
  {
    id: 'ice',
    name: 'Hielo',
    description: 'Cristales de hielo con escarcha brillante',
    rarity: 'epic',
    unlockXp: 3000,
    cssClass: 'frame-ice',
    previewGradient: 'linear-gradient(135deg, #a8d8ea, #e8f4f8, #b0e0e6)',
    category: 'elemental',
  },
  {
    id: 'shadow',
    name: 'Sombra',
    description: 'Marco oscuro con aura misteriosa',
    rarity: 'rare',
    unlockXp: 2500,
    cssClass: 'frame-shadow',
    previewGradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    category: 'elemental',
  },
  {
    id: 'lightning',
    name: 'Relámpago',
    description: 'Electricidad pura con destellos en tiempo real',
    rarity: 'epic',
    unlockXp: 4000,
    cssClass: 'frame-lightning',
    previewGradient: 'linear-gradient(135deg, #f5e642, #ffffff, #f5e642)',
    category: 'elemental',
  },

  // ── SPECIAL ────────────────────────────────────────────────────────────────
  {
    id: 'rainbow',
    name: 'Arco Iris',
    description: 'Todos los colores del espectro en movimiento',
    rarity: 'legendary',
    unlockXp: 10000,
    unlockRank: 'Legend',
    cssClass: 'frame-rainbow',
    previewGradient: 'linear-gradient(135deg, #ff0000, #ff8800, #ffff00, #00ff00, #0000ff, #8800ff)',
    category: 'special',
  },
  {
    id: 'galaxy',
    name: 'Galaxia',
    description: 'Un universo entero girando a tu alrededor',
    rarity: 'legendary',
    unlockXp: 15000,
    unlockRank: 'Champion',
    cssClass: 'frame-galaxy',
    previewGradient: 'linear-gradient(135deg, #0d0221, #370056, #720058, #ff6b9d)',
    category: 'special',
  },
];

export const RARITY_LABELS: Record<Frame['rarity'], string> = {
  common: 'Común',
  uncommon: 'Poco común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

export const RARITY_COLORS: Record<Frame['rarity'], string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export function getFrameById(id: string): Frame {
  return FRAME_CATALOG.find(f => f.id === id) ?? FRAME_CATALOG[0];
}

export function isFrameUnlocked(frame: Frame, userXp: number, userRank?: string): boolean {
  if (!frame.unlockXp) return true;
  if (userXp < frame.unlockXp) return false;
  if (frame.unlockRank && userRank !== frame.unlockRank) return false;
  return true;
}
