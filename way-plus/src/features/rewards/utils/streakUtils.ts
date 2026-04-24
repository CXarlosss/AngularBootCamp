export interface StreakMilestone {
  day: number;
  title: string;
  reward: {
    coins: number;
    xp: number;
    item?: string;
    stickerId?: string;
  };
  message: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { day: 1, title: 'Primer Paso', reward: { coins: 10, xp: 20 }, message: '¡Has encendido la chispa!' },
  { day: 3, title: 'Llama Inicial', reward: { coins: 25, xp: 50 }, message: '¡Tu racha empieza a calentar!' },
  { day: 5, title: 'Fuego Constante', reward: { coins: 50, xp: 100, stickerId: 'card-star-day' }, message: '¡Eres pura constancia!' },
  { day: 7, title: 'Semana de Fuego', reward: { coins: 100, xp: 200, item: 'cape-rainbow' }, message: '¡Una semana entera brillando!' },
  { day: 14, title: 'Dos Semanas Ardientes', reward: { coins: 250, xp: 500, item: 'hat-crown-gold' }, message: '¡Nadie puede detenerte!' },
  { day: 21, title: 'Hábito Inquebrantable', reward: { coins: 500, xp: 1000, stickerId: 'card-phoenix-rise' }, message: '¡Te has convertido en leyenda!' },
  { day: 30, title: 'Maestro WAY+', reward: { coins: 1000, xp: 2000, item: 'pet-dragon-baby' }, message: '¡Has alcanzado la cima del fuego!' },
];

export const getNextMilestone = (currentStreak: number) => {
  return STREAK_MILESTONES.find(m => m.day > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
};

export const getDailyBonus = (streak: number) => {
  return 5 + (streak * 2);
};

export const canClaimDailyBonus = (lastBonusDate: string | null): boolean => {
  if (!lastBonusDate) return true;
  const last = new Date(lastBonusDate);
  const now = new Date();
  return (
    last.getDate() !== now.getDate() ||
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
};
