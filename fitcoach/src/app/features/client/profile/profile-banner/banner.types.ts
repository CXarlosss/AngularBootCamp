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
  id:      string;
  label:   string;
  cssClass: string;
  locked:  boolean;
  req:     string;
  reqType: 'rank' | 'xp' | 'free';
  reqValue: number;
}

export const BANNER_COLORS: BannerColor[] = [
  // Gratuitos (6)
  { id:'c0', label:'Obsidiana', gradient:'linear-gradient(135deg,#1a1f2b,#0d1117)',        locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'c1', label:'Bronce',    gradient:'linear-gradient(135deg,#2d1e08,#1a1005)',         locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'c2', label:'Esmeralda', gradient:'linear-gradient(135deg,#0a1f18,#051209)',          locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'c8', label:'Océano',    gradient:'linear-gradient(135deg,#001a2d,#000d1a)',          locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'c12',label:'Pizarra',   gradient:'linear-gradient(135deg,#334155,#0f172a)',          locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'c13',label:'Bosque',    gradient:'linear-gradient(135deg,#064e3b,#022c22)',          locked:false, req:'',          reqType:'free', reqValue:0 },
  
  // Por Rango
  { id:'c3', label:'Zafiro',    gradient:'linear-gradient(135deg,#0a0e1a,#060810)',          locked:true,  req:'Centurión', reqType:'rank', reqValue:2 },
  { id:'c4', label:'Amatista',  gradient:'linear-gradient(135deg,#180a1a,#0d060f)',          locked:true,  req:'Tribuno',   reqType:'rank', reqValue:3 },
  { id:'c5', label:'Dorado',    gradient:'linear-gradient(135deg,#2d1800,#1a0e00)',          locked:true,  req:'Semidiós',  reqType:'rank', reqValue:4 },
  { id:'c6', label:'Carmesí',   gradient:'linear-gradient(135deg,#2d0000,#1a0000)',          locked:true,  req:'Zeus',      reqType:'rank', reqValue:5 },

  // Especiales / XP
  { id:'c14',label:'Cobre',     gradient:'linear-gradient(135deg,#78350f,#451a03)',          locked:true,  req:'5.000 XP',  reqType:'xp',   reqValue:5000 },
  { id:'c9', label:'Volcán',    gradient:'linear-gradient(135deg,#400000,#000000)',          locked:true,  req:'10.000 XP', reqType:'xp',   reqValue:10000 },
  { id:'c10',label:'Hielo',     gradient:'linear-gradient(135deg,#e0f2fe,#7dd3fc)',          locked:true,  req:'Tribuno',   reqType:'rank', reqValue:3 },
  { id:'c15',label:'Abismo',    gradient:'linear-gradient(135deg,#1e1b4b,#000000)',          locked:true,  req:'20.000 XP', reqType:'xp',   reqValue:20000 },
  { id:'c11',label:'Nebulosa',  gradient:'linear-gradient(135deg,#4c1d95,#1e1b4b)',          locked:true,  req:'30.000 XP', reqType:'xp',   reqValue:30000 },
  { id:'c7', label:'Aurora',    gradient:'linear-gradient(135deg,#001a2d,#1a002d,#001a0d)', locked:true,  req:'50.000 XP', reqType:'xp',   reqValue:50000 },
];

export const BANNER_PATTERNS: BannerPattern[] = [
  // Gratuitos (5)
  { id:'p0', label:'Liso',      cssClass:'pat-solid',   locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'p1', label:'Mármol',    cssClass:'pat-marble',  locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'p2', label:'Piedra',    cssClass:'pat-stone',   locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'p6', label:'Olas',      cssClass:'pat-waves',   locked:false, req:'',          reqType:'free', reqValue:0 },
  { id:'p7', label:'Puntos',    cssClass:'pat-dots',    locked:false, req:'',          reqType:'free', reqValue:0 },
  
  // Por Rango / Especiales
  { id:'p3', label:'Estrellas', cssClass:'pat-stars',   locked:true,  req:'Legionario',reqType:'rank', reqValue:1 },
  { id:'p4', label:'Fuego',     cssClass:'pat-fire',    locked:true,  req:'Tribuno',   reqType:'rank', reqValue:3 },
  { id:'p10',label:'Hexágono',  cssClass:'pat-hex',     locked:true,  req:'Tribuno',   reqType:'rank', reqValue:3 },
  { id:'p11',label:'Cruz',      cssClass:'pat-cross',   locked:true,  req:'15.000 XP', reqType:'xp',   reqValue:15000 },
  { id:'p8', label:'Diamante',  cssClass:'pat-diamond', locked:true,  req:'Semidiós',  reqType:'rank', reqValue:4 },
  { id:'p9', label:'Circuito',  cssClass:'pat-circuit', locked:true,  req:'Zeus',      reqType:'rank', reqValue:5 },
  { id:'p5', label:'Olimpo',    cssClass:'pat-olympus', locked:true,  req:'Zeus',      reqType:'rank', reqValue:5 },
];
