export interface Mission {
  id: string;
  title: string;
  description: string;
  goal: number;
  rewardCoins: number;
  rewardXp: number;
  type: 'daily' | 'weekly';
  category: 'complete_ways' | 'earn_coins' | 'open_chests' | 'streak_days';
}

export const MISSIONS_CATALOG: Mission[] = [
  // DIARIAS
  {
    id: 'd-1',
    title: 'Explorador Diario',
    description: 'Completa 3 retos hoy',
    goal: 3,
    rewardCoins: 30,
    rewardXp: 50,
    type: 'daily',
    category: 'complete_ways'
  },
  {
    id: 'd-2',
    title: 'Ahorrador',
    description: 'Consigue 50 monedas hoy',
    goal: 50,
    rewardCoins: 20,
    rewardXp: 30,
    type: 'daily',
    category: 'earn_coins'
  },
  // SEMANALES
  {
    id: 'w-1',
    title: 'Maestro de la Rutina',
    description: 'Abre el cofre misterioso 5 veces esta semana',
    goal: 5,
    rewardCoins: 200,
    rewardXp: 500,
    type: 'weekly',
    category: 'open_chests'
  },
  {
    id: 'w-2',
    title: 'Imparable',
    description: 'Consigue una racha de 5 días esta semana',
    goal: 5,
    rewardCoins: 150,
    rewardXp: 400,
    type: 'weekly',
    category: 'streak_days'
  },
  {
    id: 'w-3',
    title: 'Gran Atesorador',
    description: 'Consigue 500 monedas esta semana',
    goal: 500,
    rewardCoins: 300,
    rewardXp: 800,
    type: 'weekly',
    category: 'earn_coins'
  }
];

export const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
};

export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};
