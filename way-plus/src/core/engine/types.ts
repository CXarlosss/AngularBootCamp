// src/core/engine/types.ts

export type WayType = 'double-choice' | 'sequencing' | 'roleplay' | 'tracing' | 'voice' | 'memory';

export interface Option {
  id: string;
  image: string;          // Pictograma opción
  label: string;          // Para lectura asistida
  isCorrect: boolean;
  feedback: {
    visual: 'happy' | 'sad';
    sound?: string;
    animation?: string;
  };
}

export interface Way {
  id: string;
  stepId: string;
  type: WayType;
  order: number;
  stimulus: {
    image?: string;        // Pictograma principal (opcional para algunos tipos)
    audio?: string;       // Narración para niños con dificultades lectoras
    text?: string;        // Texto para el guía (no para el niño)
  };
  options: Option[];
  startPoint?: { x: number; y: number }; // Para tipos como 'tracing'
  metadata: {
    skillTag: string;     // Ej: "autonomy.hygiene.hands"
    difficulty: 1 | 2 | 3;
    estimatedTime: number; // segundos
  };
}

export interface Step {
  id: string;
  levelId: string;
  title: string;
  subtitle?: string;
  theme: 'relaxation' | 'self-esteem' | 'assertiveness' | string;
  order?: number;
  ways: Way[];
  completionReward?: Reward;
}

export interface Reward {
  id?: string;
  type?: 'badge' | 'avatar-part' | 'sound' | 'economic';
  name?: string;
  image?: string;
  coins?: number;
  xp?: number;
  item?: string;
}

export interface Level {
  id: string;
  name: string;           // "PREGAMER", "GAMER", "PRO"
  minAge: number;
  maxAge: number;
  avatarTheme: string;
  steps: string[];        // IDs
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string; // URL or ID
  currentLevel: string;
  completedWays: string[];
  streakDays: number;
}
