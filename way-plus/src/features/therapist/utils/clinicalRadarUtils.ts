/**
 * Logic to calculate clinical competencies based on game data.
 */

export interface CompetencyScores {
  autonomy: number;
  assertiveness: number;
  regulation: number;
  social: number;
  persistence: number;
}

export interface Imbalance {
  type: 'warning' | 'danger';
  areaA: string;
  areaB: string;
  diff: number;
  message: string;
}

export const COMPETENCY_LABELS: Record<keyof CompetencyScores, string> = {
  autonomy: 'Autonomía',
  assertiveness: 'Asertividad',
  regulation: 'Autorregulación',
  social: 'Social',
  persistence: 'Persistencia'
};

export const COMPETENCY_ICONS: Record<keyof CompetencyScores, string> = {
  autonomy: '⚡',
  assertiveness: '🛡️',
  regulation: '🧘',
  social: '🤝',
  persistence: '💪'
};

/**
 * Calculates scores (0-100) for each area.
 */
export function calculateCompetencies(data: {
  completedWays: string[];
  relaxationLog: Record<string, any>;
  roleplayLog: Record<string, any>;
  streakDays: number;
  totalXp: number;
}): CompetencyScores {
  const { completedWays, relaxationLog, roleplayLog, streakDays, totalXp } = data;
  const safeWays = Array.isArray(completedWays) ? completedWays : [];

  // 1. Autonomía: Diversity of ways + total completed
  const autonomyScore = Math.min(100, (safeWays.length * 2) + (new Set(safeWays.map(id => id ? id.split('-')[0] : '')).size * 10));

  // 2. Asertividad: Specific "assertive" ways
  const assertiveWays = safeWays.filter(id => id && typeof id === 'string' && id.includes('assertive')).length;
  const assertivenessScore = Math.min(100, assertiveWays * 15 + 10);

  // 3. Autorregulación: Relaxation sessions + "relax" ways
  const relaxSessions = Object.values(relaxationLog || {}).filter((r: any) => r && r.completed).length;
  const relaxWays = safeWays.filter(id => id && typeof id === 'string' && id.includes('relax')).length;
  const regulationScore = Math.min(100, (relaxSessions * 5) + (relaxWays * 10));

  // 4. Social: Roleplay sessions + "social" ways
  const roleplaySessions = Object.keys(roleplayLog || {}).length;
  const socialWays = safeWays.filter(id => id && typeof id === 'string' && id.includes('social')).length;
  const socialScore = Math.min(100, (roleplaySessions * 8) + (socialWays * 12));

  // 5. Persistencia: Streaks + XP / 100
  const persistenceScore = Math.min(100, (streakDays * 5) + (totalXp / 50));

  return {
    autonomy: Math.round(autonomyScore),
    assertiveness: Math.round(assertivenessScore),
    regulation: Math.round(regulationScore),
    social: Math.round(socialScore),
    persistence: Math.round(persistenceScore)
  };
}

/**
 * Detects significant gaps between competencies.
 */
export const detectImbalances = (scores: CompetencyScores): Imbalance[] => {
  let maxDiff = 0;
  let worstImbalance: Imbalance | null = null;
  const entries = Object.entries(scores) as [keyof CompetencyScores, number][];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [nameA, scoreA] = entries[i];
      const [nameB, scoreB] = entries[j];
      const diff = Math.abs(scoreA - scoreB);
      
      // Encontrar el desequilibrio más significativo que supere el umbral
      if (diff > 40 && diff > maxDiff) {
        maxDiff = diff;
        const strongerArea = scoreA > scoreB ? nameA : nameB;
        const weakerArea = scoreA > scoreB ? nameB : nameA;
        
        worstImbalance = {
          type: diff > 60 ? 'danger' : 'warning',
          message: `Se observa un desarrollo muy potente en ${COMPETENCY_LABELS[strongerArea]}, lo que nos da una gran oportunidad para fortalecer ${COMPETENCY_LABELS[weakerArea]} equilibrar el perfil.`,
          areaA: strongerArea,
          areaB: weakerArea,
          diff: diff
        };
      }
    }
  }
  return worstImbalance ? [worstImbalance] : [];
};

export function getProfileLabel(scores: CompetencyScores): string {
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
  if (avg > 80) return 'Perfil Excepcional';
  if (avg > 60) return 'Perfil Equilibrado';
  if (avg > 40) return 'En Desarrollo';
  return 'Iniciando Camino';
}
