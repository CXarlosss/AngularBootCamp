export type RankFrame = 'rank_0' | 'rank_1' | 'rank_2' | 'rank_3' | 'rank_4' | 'rank_5';
export type SpecialFrame = 'streak_30' | 'pr_10' | 'coach_star';
export type FrameId = RankFrame | SpecialFrame | 'rank';

export interface FrameDef {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  cssClass:    string;
  req:         string;
  isSpecial:   boolean;
}

export const FRAME_DEFS: FrameDef[] = [
  // Rango
  { id:'rank_0', name:'Sin marco',       emoji:'⚔️', description:'Marco inicial',               cssClass:'frame-rank-0', req:'Recruta',       isSpecial:false },
  { id:'rank_1', name:'Bronce',          emoji:'🛡️', description:'Anillo broncíneo',             cssClass:'frame-rank-1', req:'Legionario',    isSpecial:false },
  { id:'rank_2', name:'Plata',           emoji:'🏛️', description:'Resplandor plateado',          cssClass:'frame-rank-2', req:'Centurión',     isSpecial:false },
  { id:'rank_3', name:'Esmeralda',       emoji:'🔱', description:'Brillo esmeralda',             cssClass:'frame-rank-3', req:'Tribuno',       isSpecial:false },
  { id:'rank_4', name:'Dorado',          emoji:'⚡', description:'Pulso dorado animado',         cssClass:'frame-rank-4', req:'Semidiós',      isSpecial:false },
  { id:'rank_5', name:'Zeus',            emoji:'👑', description:'Llama carmesí pulsante',       cssClass:'frame-rank-5', req:'Zeus Eterno',   isSpecial:false },
  // Especiales
  { id:'streak_30', name:'Llama Eterna',    emoji:'🔥', description:'30 días de racha',         cssClass:'frame-streak', req:'Racha 30 días', isSpecial:true  },
  { id:'pr_10',     name:'Récord Olímpico', emoji:'🏆', description:'10 PRs en un mes',         cssClass:'frame-pr',     req:'10 PRs/mes',    isSpecial:true  },
  { id:'coach_star',name:'Favorito',        emoji:'⭐', description:'Otorgado por el coach',     cssClass:'frame-coach',  req:'Coach award',   isSpecial:true  },
];
