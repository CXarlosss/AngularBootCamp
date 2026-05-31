export interface BannerColor {
  id:       string;
  label:    string;
  gradient: string;
  locked:   boolean;
  req:      string;
  reqType:  'rank' | 'xp' | 'free';
  reqValue: number;
}

export interface BannerPattern {
  id:       string;
  label:    string;
  cssClass: string;
  locked:   boolean;
  req:      string;
  reqType:  'rank' | 'xp' | 'free';
  reqValue: number;
}

export const BANNER_COLORS: BannerColor[] = [

  // ── GRATUITOS (6) ─────────────────────────────────────────────────────────
  {
    id: 'c0', label: 'Obsidiana',
    gradient: 'linear-gradient(135deg, #1a1f2b 0%, #0d1117 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },
  {
    id: 'c1', label: 'Bronce Antiguo',
    gradient: 'linear-gradient(135deg, #2d1e08 0%, #1a1005 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },
  {
    id: 'c2', label: 'Esmeralda',
    gradient: 'linear-gradient(135deg, #0a3d2b 0%, #051a12 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },
  {
    id: 'c8', label: 'Abismo Marino',
    gradient: 'linear-gradient(135deg, #00274d 0%, #000d1a 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },
  {
    id: 'c12', label: 'Pizarra',
    gradient: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },
  {
    id: 'c13', label: 'Selva Oscura',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    locked: false, req: '', reqType: 'free', reqValue: 0
  },

  // ── NIVEL 1 — Legionario ──────────────────────────────────────────────────
  {
    id: 'cn1', label: 'Neón Verde',
    gradient: 'linear-gradient(135deg, #00ff87 0%, #0a4d2e 50%, #001a0f 100%)',
    locked: true, req: 'Legionario', reqType: 'rank', reqValue: 1
  },
  {
    id: 'cn2', label: 'Azul Eléctrico',
    gradient: 'linear-gradient(135deg, #00c3ff 0%, #003d7a 50%, #000d1a 100%)',
    locked: true, req: 'Legionario', reqType: 'rank', reqValue: 1
  },

  // ── NIVEL 2 — Centurión ───────────────────────────────────────────────────
  {
    id: 'c3', label: 'Zafiro Real',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #0a0e1a 100%)',
    locked: true, req: 'Centurión', reqType: 'rank', reqValue: 2
  },
  {
    id: 'cn3', label: 'Cian Glacial',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 50%, #001a1f 100%)',
    locked: true, req: 'Centurión', reqType: 'rank', reqValue: 2
  },

  // ── NIVEL 3 — Tribuno ─────────────────────────────────────────────────────
  {
    id: 'c4', label: 'Púrpura Profundo',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #1a0530 100%)',
    locked: true, req: 'Tribuno', reqType: 'rank', reqValue: 3
  },
  {
    id: 'cn4', label: 'Rosa Magenta',
    gradient: 'linear-gradient(135deg, #f0abfc 0%, #a21caf 50%, #3b0764 100%)',
    locked: true, req: 'Tribuno', reqType: 'rank', reqValue: 3
  },
  {
    id: 'c10', label: 'Hielo Ártico',
    gradient: 'linear-gradient(135deg, #bae6fd 0%, #38bdf8 50%, #0c4a6e 100%)',
    locked: true, req: 'Tribuno', reqType: 'rank', reqValue: 3
  },

  // ── NIVEL 4 — Semidiós ────────────────────────────────────────────────────
  {
    id: 'c5', label: 'Dorado Real',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 40%, #78350f 100%)',
    locked: true, req: 'Semidiós', reqType: 'rank', reqValue: 4
  },
  {
    id: 'cn5', label: 'Naranja Fuego',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 40%, #431407 100%)',
    locked: true, req: 'Semidiós', reqType: 'rank', reqValue: 4
  },

  // ── NIVEL 5 — Zeus ────────────────────────────────────────────────────────
  {
    id: 'c6', label: 'Carmesí Infernal',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 40%, #3b0000 100%)',
    locked: true, req: 'Zeus', reqType: 'rank', reqValue: 5
  },

  // ── XP ESPECIALES ─────────────────────────────────────────────────────────
  {
    id: 'c14', label: 'Cobre Ardiente',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 50%, #431407 100%)',
    locked: true, req: '5.000 XP', reqType: 'xp', reqValue: 5000
  },
  {
    id: 'c9', label: 'Volcán',
    gradient: 'linear-gradient(135deg, #ff4500 0%, #8b0000 50%, #0a0000 100%)',
    locked: true, req: '10.000 XP', reqType: 'xp', reqValue: 10000
  },
  {
    id: 'c15', label: 'Abismo Índigo',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #312e81 50%, #000000 100%)',
    locked: true, req: '20.000 XP', reqType: 'xp', reqValue: 20000
  },
  {
    id: 'c11', label: 'Nebulosa',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 30%, #1e1b4b 70%, #000000 100%)',
    locked: true, req: '30.000 XP', reqType: 'xp', reqValue: 30000
  },
  {
    id: 'c_supernova', label: 'Supernova',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #1e1b4b 100%)',
    locked: true, req: '40.000 XP', reqType: 'xp', reqValue: 40000
  },
  {
    id: 'c_cyberpunk', label: 'Neon Cyberpunk',
    gradient: 'linear-gradient(135deg, #facc15 0%, #f43f5e 50%, #0f172a 100%)',
    locked: true, req: 'Tribuno', reqType: 'rank', reqValue: 3
  },
  {
    id: 'c_quantum', label: 'Cuántico',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0284c7 35%, #0d9488 70%, #111827 100%)',
    locked: true, req: 'Semidiós', reqType: 'rank', reqValue: 4
  },
  {
    id: 'c_hyperdrive', label: 'Hiperespacio',
    gradient: 'linear-gradient(135deg, #000000 0%, #6366f1 50%, #00ffff 100%)',
    locked: true, req: 'Zeus', reqType: 'rank', reqValue: 5
  },
  {
    id: 'c_matrix', label: 'Matrix',
    gradient: 'linear-gradient(135deg, #000000 0%, #22c55e 40%, #052e16 100%)',
    locked: true, req: '25.000 XP', reqType: 'xp', reqValue: 25000
  },
  {
    id: 'c7', label: 'Aurora Boreal',
    gradient: 'linear-gradient(135deg, #00ff87 0%, #00c3ff 25%, #9c27b0 50%, #001a0d 100%)',
    locked: true, req: '50.000 XP', reqType: 'xp', reqValue: 50000
  },
  {
    id: 'c16', label: 'Plasma',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)',
    locked: true, req: '15.000 XP', reqType: 'xp', reqValue: 15000
  },
  {
    id: 'c17', label: 'Fuego Fatuo',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    locked: true, req: '35.000 XP', reqType: 'xp', reqValue: 35000
  },
  {
    id: 'c18', label: 'Oro Líquido',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
    locked: true, req: '45.000 XP', reqType: 'xp', reqValue: 45000
  },
  {
    id: 'c19', label: 'Orbital',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #d946ef 100%)',
    locked: true, req: 'Zeus', reqType: 'rank', reqValue: 5
  },
];

export const BANNER_PATTERNS: BannerPattern[] = [

  // ── GRATUITOS (5) ─────────────────────────────────────────────────────────
  { id: 'p0',  label: 'Liso',             cssClass: 'pat-solid',    locked: false, req: '',            reqType: 'free', reqValue: 0 },
  { id: 'p1',  label: 'Mármol',           cssClass: 'pat-marble',   locked: false, req: '',            reqType: 'free', reqValue: 0 },
  { id: 'p2',  label: 'Piedra',           cssClass: 'pat-stone',    locked: false, req: '',            reqType: 'free', reqValue: 0 },
  { id: 'p6',  label: 'Olas',             cssClass: 'pat-waves',    locked: false, req: '',            reqType: 'free', reqValue: 0 },
  { id: 'p7',  label: 'Puntos',           cssClass: 'pat-dots',     locked: false, req: '',            reqType: 'free', reqValue: 0 },

  // ── NIVEL 1 — Legionario ──────────────────────────────────────────────────
  { id: 'p3',  label: 'Estrellas',        cssClass: 'pat-stars',    locked: true,  req: 'Legionario',  reqType: 'rank', reqValue: 1 },
  { id: 'p12', label: 'Líneas Diag.',     cssClass: 'pat-diag',     locked: true,  req: 'Legionario',  reqType: 'rank', reqValue: 1 },

  // ── NIVEL 2 — Centurión ───────────────────────────────────────────────────
  { id: 'p13', label: 'Puntos Grandes',   cssClass: 'pat-bigdots',  locked: true,  req: 'Centurión',   reqType: 'rank', reqValue: 2 },
  { id: 'p8',  label: 'Diamante',         cssClass: 'pat-diamond',  locked: true,  req: 'Centurión',   reqType: 'rank', reqValue: 2 },

  // ── NIVEL 3 — Tribuno ─────────────────────────────────────────────────────
  { id: 'p4',  label: 'Fuego',            cssClass: 'pat-fire',     locked: true,  req: 'Tribuno',     reqType: 'rank', reqValue: 3 },
  { id: 'p10', label: 'Hexágonos',        cssClass: 'pat-hex',      locked: true,  req: 'Tribuno',     reqType: 'rank', reqValue: 3 },
  { id: 'p14', label: 'Ondas Sinuosas',   cssClass: 'pat-sinewave', locked: true,  req: 'Tribuno',     reqType: 'rank', reqValue: 3 },

  // ── XP / RANK ALTO ────────────────────────────────────────────────────────
  { id: 'p11', label: 'Cruz Táctica',     cssClass: 'pat-cross',    locked: true,  req: '15.000 XP',   reqType: 'xp',   reqValue: 15000 },
  { id: 'p9',  label: 'Circuito',         cssClass: 'pat-circuit',  locked: true,  req: 'Zeus',        reqType: 'rank', reqValue: 5 },
  { id: 'p5',  label: 'Olimpo',           cssClass: 'pat-olympus',  locked: true,  req: 'Zeus',        reqType: 'rank', reqValue: 5 },
];
