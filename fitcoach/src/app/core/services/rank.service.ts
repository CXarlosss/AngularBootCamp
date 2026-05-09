import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export interface RankDef {
  id:       string;
  level:    number;
  emoji:    string;
  name:     string;
  title:    string;
  quote:    string;
  color:    string;
  xpBase:   number;
  xpStep:   number; // XP por cada una de las 4 divisiones
}

export interface AthleteRank {
  xpTotal:    number;
  rankLevel:  number;
  daysXp:     number;
  setsXp:     number;
  progressXp: number;
}

export interface FullRank {
  rank:       RankDef;
  division:   number;   // 0-3 (0=IV, 3=I)
  divLabel:   string;   // 'IV','III','II','I'
  pct:        number;   // % dentro de la división actual
  xpToNext:   number;
  nextLabel:  string | null;
}

export const DIVISIONS = ['IV', 'III', 'II', 'I'];

export const RANKS: RankDef[] = [
  { id: 'recruit', level:0, emoji:'⚔️', name:'Recruta',
    title:'Rango I · Nuevo soldado',
    quote:'"Todo gran guerrero empezó aquí"',
    color:'#b47828', xpBase:0,     xpStep:125  },
  { id: 'legionary', level:1, emoji:'🛡️', name:'Legionario',
    title:'Rango II · Legión Romana',
    quote:'"Forjado en el campo de batalla"',
    color:'#1D9E75', xpBase:500,   xpStep:375  },
  { id: 'centurion', level:2, emoji:'🏛️', name:'Centurión',
    title:'Rango III · Cien guerreros',
    quote:'"Líder nato, disciplina de hierro"',
    color:'#378ADD', xpBase:2000,  xpStep:750  },
  { id: 'tribune', level:3, emoji:'🔱', name:'Tribuno',
    title:'Rango IV · Tribuno militar',
    quote:'"Los dioses observan tu ascenso"',
    color:'#8B5CF6', xpBase:5000,  xpStep:1750 },
  { id: 'demigod', level:4, emoji:'⚡', name:'Semidiós',
    title:'Rango V · Hijo del Olimpo',
    quote:'"Hércules reconoce tu fuerza"',
    color:'#D97706', xpBase:12000, xpStep:4500 },
  { id: 'zeus', level:5, emoji:'👑', name:'Campeón Olímpico',
    title:'Rango VI · Dios del Olimpo',
    quote:'"Zeus mismo inclina la cabeza"',
    color:'#DC2626', xpBase:30000, xpStep:17500 },
];

@Injectable({ providedIn: 'root' })
export class RankService {
  private sb   = inject(SupabaseService).client;
  private auth = inject(AuthService);

  athleteRank = signal<AthleteRank | null>(null);
  rankedUp    = signal<string | null>(null); 

  // ─── Computed principal ────────────────────────────────────────────────────

  fullRank = computed<FullRank | null>(() => {
    const ar = this.athleteRank();
    if (!ar) return null;
    return this.calcFullRank(ar.xpTotal);
  });

  // ─── Cálculo ───────────────────────────────────────────────────────────────

  calcFullRank(xp: number): FullRank {
    let ri = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].xpBase) { ri = i; break; }
    }

    const rank = RANKS[ri];
    const rel  = xp - rank.xpBase;
    
    // División (0 a 3)
    const di   = Math.min(3, Math.floor(rel / rank.xpStep));
    const xpInDiv  = rel - (di * rank.xpStep);
    const pct      = Math.round((xpInDiv / rank.xpStep) * 100);
    const toNext   = rank.xpStep - xpInDiv;

    let nextLabel: string | null = null;
    if (di < 3) {
      nextLabel = `${rank.name} ${DIVISIONS[di + 1]}`;
    } else if (ri < RANKS.length - 1) {
      nextLabel = `${RANKS[ri + 1].name} IV`;
    }

    return {
      rank,
      division:  di,
      divLabel:  DIVISIONS[di],
      pct:       Math.min(100, pct),
      xpToNext:  toNext,
      nextLabel,
    };
  }

  // ─── Load ──────────────────────────────────────────────────────────────────

  async load(userId?: string): Promise<void> {
    const id = userId ?? this.auth.user()?.id;
    if (!id) {
      console.warn('[RankService] load: no hay id de usuario');
      return;
    }

    console.log('[RankService] Cargando rango para:', id);
    const { data, error } = await this.sb
      .from('athlete_ranks')
      .select('*')
      .eq('client_id', id)
      .maybeSingle();

    if (error) {
      console.error('[RankService] Error cargando rango:', error);
      return;
    }

    if (data) {
      this.athleteRank.set({
        xpTotal:    data.xp_total,
        rankLevel:  data.rank_level,
        daysXp:     data.days_xp,
        setsXp:     data.sets_xp,
        progressXp: data.progress_xp,
      });
    } else {
      console.log('[RankService] No existe registro, creando uno nuevo para:', id);
      const { data: newData, error: insError } = await this.sb
        .from('athlete_ranks')
        .insert({ client_id: id })
        .select()
        .maybeSingle();

      if (insError) {
        console.error('[RankService] Error al crear registro de rango:', insError);
        return;
      }

      // Si newData es null (puede pasar por RLS tras insert), inicializamos a mano
      this.athleteRank.set({
        xpTotal: 0, rankLevel: 0,
        daysXp: 0, setsXp: 0, progressXp: 0
      });
    }
  }

  async getAthleteRank(clientId: string): Promise<AthleteRank | null> {
    const { data } = await this.sb
      .from('athlete_ranks')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (!data) return null;

    return {
      xpTotal:    data.xp_total,
      rankLevel:  data.rank_level,
      daysXp:     data.days_xp,
      setsXp:     data.sets_xp,
      progressXp: data.progress_xp,
    };
  }

  // ─── AddXP ────────────────────────────────────────────────────────────────

  async addXP(params: {
    daysXp: number;
    setsXp: number;
    progressXp: number;
  }): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) {
      console.error('[RankService] addXP: no hay userId');
      return;
    }

    // Auto-load si no hay datos
    if (!this.athleteRank()) {
      console.log('[RankService] Datos de rango ausentes. Intentando carga forzada...');
      await this.load(userId);
    }

    const cur = this.athleteRank();
    if (!cur) {
      console.error('[RankService] addXP: athleteRank sigue null después de load');
      return;
    }

    const prevFull = this.calcFullRank(cur.xpTotal);
    const newTotal =
      cur.xpTotal + params.daysXp + params.setsXp + params.progressXp;
    const newFull = this.calcFullRank(newTotal);
    const newLevel = newFull.rank.level;

    const didLevelUp = newFull.rank.level > prevFull.rank.level;
    const didDivUp = !didLevelUp && newFull.division > prevFull.division;

    await this.sb
      .from('athlete_ranks')
      .update({
        xp_total: newTotal,
        rank_level: newLevel,
        days_xp: cur.daysXp + params.daysXp,
        sets_xp: cur.setsXp + params.setsXp,
        progress_xp: cur.progressXp + params.progressXp,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', userId);

    this.athleteRank.set({
      xpTotal: newTotal,
      rankLevel: newLevel,
      daysXp: cur.daysXp + params.daysXp,
      setsXp: cur.setsXp + params.setsXp,
      progressXp: cur.progressXp + params.progressXp,
    });

    if (didLevelUp || didDivUp) {
      const label = `${newFull.rank.name} ${newFull.divLabel}`;
      this.rankedUp.set(label);
      setTimeout(() => this.rankedUp.set(null), 4000);
    }
  }
}
