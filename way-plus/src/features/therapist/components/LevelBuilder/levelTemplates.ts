/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Level Templates — Biblioteca clínica pre-diseñada
 * Plantillas validadas por objetivo terapéutico
 * ═══════════════════════════════════════════════════════════════
 */

import type { TaskType } from './useLevelBuilder';

export interface TemplateTask {
  title: string;
  description: string;
  type: TaskType;
  config: {
    instructionText: string;
    successFeedback: string;
    timeLimitSeconds: number;
    attemptsAllowed: number;
    targetEmoji?: string;
  };
}

export interface LevelTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: number;
  estimatedMinutes: number;
  targetSkills: string[];
  tasks: TemplateTask[];
  recommendedFor: string[];
  adaptiveConfig: {
    initialTimeLimit: number;
    initialTargetSize: 'large' | 'medium' | 'small';
    maxDistractions: number;
  };
}

export const TEMPLATE_CATEGORIES = [
  { id: 'atencion', label: 'Atención sostenida', emoji: '🎯', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'regulacion', label: 'Regulación emocional', emoji: '🧘', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'memoria', label: 'Memoria de trabajo', emoji: '🧠', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: 'coordinacion', label: 'Coordinación visomotora', emoji: '✋', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'lenguaje', label: 'Comprensión y expresión', emoji: '💬', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export const LEVEL_TEMPLATES: LevelTemplate[] = [
  // ═══════════════════════════════════════════════════════════
  // ATENCIÓN
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tpl-atencion-01',
    category: 'atencion',
    title: 'Encuentra la estrella perdida',
    description: 'Ejercicio de atención selectiva y sostenida. El niño debe identificar un objetivo entre distractores visuales.',
    emoji: '⭐',
    difficulty: 3,
    estimatedMinutes: 8,
    targetSkills: ['Atención selectiva', 'Inhibición de respuesta', 'Velocidad de procesamiento'],
    recommendedFor: ['TDAH', 'Dificultades de atención', '5-8 años'],
    adaptiveConfig: { initialTimeLimit: 20, initialTargetSize: 'large', maxDistractions: 4 },
    tasks: [
      {
        title: 'Toca la estrella amarilla',
        description: 'Estrella entre 3 distractoras',
        type: 'tap',
        config: {
          instructionText: '¡Encuentra la estrella amarilla!',
          successFeedback: '¡Vista de águila! La encontraste.',
          timeLimitSeconds: 15,
          attemptsAllowed: 3,
          targetEmoji: '⭐',
        },
      },
      {
        title: 'La estrella se esconde',
        description: 'Estrella entre 5 distractoras, movimiento sutil',
        type: 'tap',
        config: {
          instructionText: 'Ahora hay más estrellas... solo toca la amarilla.',
          successFeedback: '¡Increíble! No te distrae nada.',
          timeLimitSeconds: 12,
          attemptsAllowed: 3,
          targetEmoji: '⭐',
        },
      },
      {
        title: 'Encuentra y mantén',
        description: 'Toque sostenido para confirmar',
        type: 'hold',
        config: {
          instructionText: 'Toca la estrella y mantén el dedo un momento.',
          successFeedback: '¡Perfecto! Sabes esperar.',
          timeLimitSeconds: 10,
          attemptsAllowed: 3,
          targetEmoji: '⭐',
        },
      },
    ],
  },
  {
    id: 'tpl-atencion-02',
    category: 'atencion',
    title: 'Semáforo de atención',
    description: 'Entrenamiento de atención alterna e inhibición. El niño debe responder solo a señales específicas y omitir otras.',
    emoji: '🚦',
    difficulty: 5,
    estimatedMinutes: 10,
    targetSkills: ['Atención alterna', 'Control inhibitorio', 'Flexibilidad cognitiva'],
    recommendedFor: ['TDAH', 'Funciones ejecutivas', '7-10 años'],
    adaptiveConfig: { initialTimeLimit: 15, initialTargetSize: 'medium', maxDistractions: 3 },
    tasks: [
      {
        title: 'Toca solo el verde',
        description: 'Inhibir respuesta a rojo y amarillo',
        type: 'tap',
        config: {
          instructionText: 'Toca solo el círculo verde. ¡Ignora los demás!',
          successFeedback: '¡Muy bien! Solo respondiste al verde.',
          timeLimitSeconds: 12,
          attemptsAllowed: 3,
          targetEmoji: '🟢',
        },
      },
      {
        title: 'Verde = toca, Rojo = espera',
        description: 'Regla de inhibición',
        type: 'tap',
        config: {
          instructionText: 'Verde = toca. Rojo = no toques.',
          successFeedback: '¡Control perfecto! Sabes esperar.',
          timeLimitSeconds: 10,
          attemptsAllowed: 3,
          targetEmoji: '🟢',
        },
      },
      {
        title: 'Cambia la regla',
        description: 'Flexibilidad: ahora toca el rojo',
        type: 'tap',
        config: {
          instructionText: '¡Cambio! Ahora toca solo el ROJO.',
          successFeedback: '¡Adaptación genial! Cambiaste de regla.',
          timeLimitSeconds: 10,
          attemptsAllowed: 4,
          targetEmoji: '🔴',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // REGULACIÓN EMOCIONAL
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tpl-regulacion-01',
    category: 'regulacion',
    title: 'Respiración del globo',
    description: 'Ejercicio de regulación mediante respiración sincronizada. El niño mantiene presionado mientras "infla" un globo visual.',
    emoji: '🎈',
    difficulty: 2,
    estimatedMinutes: 5,
    targetSkills: ['Regulación fisiológica', 'Tolerancia a la frustración', 'Conciencia corporal'],
    recommendedFor: ['Ansiedad', 'Autismo', 'Ira/Frustración', '4-10 años'],
    adaptiveConfig: { initialTimeLimit: 30, initialTargetSize: 'large', maxDistractions: 0 },
    tasks: [
      {
        title: 'Infla el globo azul',
        description: 'Mantén presionado 3 segundos',
        type: 'hold',
        config: {
          instructionText: 'Pon tu dedo aquí y respira lento... el globo crece.',
          successFeedback: '¡Qué respiración tan tranquila!',
          timeLimitSeconds: 30,
          attemptsAllowed: 5,
          targetEmoji: '🎈',
        },
      },
      {
        title: 'Suelta el globo',
        description: 'Soltar para exhalar',
        type: 'tap',
        config: {
          instructionText: 'El globo está listo. Toca para soltarlo suavemente.',
          successFeedback: '¡Soltaste con calma! Así se siente el alivio.',
          timeLimitSeconds: 15,
          attemptsAllowed: 3,
          targetEmoji: '🎈',
        },
      },
      {
        title: 'Globo grande, respiración larga',
        description: 'Mantén más tiempo',
        type: 'hold',
        config: {
          instructionText: 'Este globo necesita más aire. Mantén un poquito más.',
          successFeedback: '¡Aguantaste! Eres muy fuerte por dentro.',
          timeLimitSeconds: 30,
          attemptsAllowed: 5,
          targetEmoji: '🎈',
        },
      },
    ],
  },
  {
    id: 'tpl-regulacion-02',
    category: 'regulacion',
    title: 'Zona de calma',
    description: 'Secuencia de tareas predecibles y repetitivas para bajar la activación emocional después de un momento de estrés.',
    emoji: '🌊',
    difficulty: 2,
    estimatedMinutes: 6,
    targetSkills: ['Regulación emocional', 'Secuenciación', 'Predicción'],
    recommendedFor: ['Autismo', 'Ansiedad', 'Crisis emocionales', '5-12 años'],
    adaptiveConfig: { initialTimeLimit: 60, initialTargetSize: 'large', maxDistractions: 0 },
    tasks: [
      {
        title: 'Toca la ola 3 veces',
        description: 'Ritmo repetitivo calmante',
        type: 'tap',
        config: {
          instructionText: 'Toca la ola... 1, 2, 3. Despacio.',
          successFeedback: 'Ritmo perfecto. Sientes la calma.',
          timeLimitSeconds: 20,
          attemptsAllowed: 5,
          targetEmoji: '🌊',
        },
      },
      {
        title: 'Arrastra la piedra al centro',
        description: 'Movimiento centrado y pausado',
        type: 'drag',
        config: {
          instructionText: 'Lleva la piedra al círculo del centro. Sin prisa.',
          successFeedback: 'Centrado. Todo está en su lugar.',
          timeLimitSeconds: 25,
          attemptsAllowed: 4,
          targetEmoji: '🪨',
        },
      },
      {
        title: 'Mantén la burbuja',
        description: 'Hold suave como contención',
        type: 'hold',
        config: {
          instructionText: 'Mantén la burbuja sin que reviente. Suave.',
          successFeedback: '¡Cuidado perfecto! Estás muy tranquilo.',
          timeLimitSeconds: 20,
          attemptsAllowed: 5,
          targetEmoji: '🫧',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // MEMORIA
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tpl-memoria-01',
    category: 'memoria',
    title: 'Parejas del bosque',
    description: 'Juego de memoria visual con emojis de animales. Trabaja memoria de trabajo visual y estrategias de agrupación.',
    emoji: '🃏',
    difficulty: 4,
    estimatedMinutes: 10,
    targetSkills: ['Memoria visual de trabajo', 'Estrategias de codificación', 'Atención sostenida'],
    recommendedFor: ['Dificultades de memoria', 'TDAH', '6-10 años'],
    adaptiveConfig: { initialTimeLimit: 45, initialTargetSize: 'medium', maxDistractions: 0 },
    tasks: [
      {
        title: 'Encuentra la pareja del zorro',
        description: 'Memoria con 3 parejas',
        type: 'memory',
        config: {
          instructionText: 'Toca las cartas para encontrar al amigo del zorro.',
          successFeedback: '¡Qué memoria! Encontraste la pareja.',
          timeLimitSeconds: 30,
          attemptsAllowed: 6,
          targetEmoji: '🦊',
        },
      },
      {
        title: 'Ahora con más cartas',
        description: 'Memoria con 6 parejas',
        type: 'memory',
        config: {
          instructionText: 'Hay más amigos escondidos. Encuentra las parejas.',
          successFeedback: '¡Reto superado! Tu memoria crece.',
          timeLimitSeconds: 45,
          attemptsAllowed: 10,
          targetEmoji: '🦊',
        },
      },
      {
        title: 'Recuerda la secuencia',
        description: 'Memoria de orden',
        type: 'tap',
        config: {
          instructionText: 'Mira la secuencia y repítela en el mismo orden.',
          successFeedback: '¡Secuencia perfecta! Gran memoria.',
          timeLimitSeconds: 20,
          attemptsAllowed: 3,
          targetEmoji: '🧩',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // COORDINACIÓN
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tpl-coordinacion-01',
    category: 'coordinacion',
    title: 'Trazo del camino',
    description: 'Ejercicio de trazado fino para mejorar control motor y planificación de movimiento.',
    emoji: '✏️',
    difficulty: 4,
    estimatedMinutes: 8,
    targetSkills: ['Control fino', 'Planificación motora', 'Coordinación visomotora'],
    recommendedFor: ['Dispraxias', 'Disgrafía', 'TDAH motor', '5-9 años'],
    adaptiveConfig: { initialTimeLimit: 30, initialTargetSize: 'large', maxDistractions: 1 },
    tasks: [
      {
        title: 'Sigue la línea recta',
        description: 'Trazo simple',
        type: 'trace',
        config: {
          instructionText: 'Lleva la estrella por el camino recto hasta la luna.',
          successFeedback: '¡Línea perfecta! Muy controlado.',
          timeLimitSeconds: 20,
          attemptsAllowed: 4,
          targetEmoji: '⭐',
        },
      },
      {
        title: 'Camino con curvas',
        description: 'Trazo curvo',
        type: 'trace',
        config: {
          instructionText: 'Ahora el camino tiene curvas. Ve despacio.',
          successFeedback: '¡Curvas dominadas! Tu mano obedece.',
          timeLimitSeconds: 25,
          attemptsAllowed: 4,
          targetEmoji: '🌙',
        },
      },
      {
        title: 'Camino estrecho',
        description: 'Trazo de precisión',
        type: 'trace',
        config: {
          instructionText: 'El camino se hizo más estrecho. Con mucho cuidado.',
          successFeedback: '¡Precisión increíble! Eres un experto.',
          timeLimitSeconds: 25,
          attemptsAllowed: 5,
          targetEmoji: '🌟',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // LENGUAJE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tpl-lenguaje-01',
    category: 'lenguaje',
    title: 'Une las palabras',
    description: 'Ejercicio de emparejamiento semántico. El niño une palabras con su imagen o significado correspondiente.',
    emoji: '🔗',
    difficulty: 3,
    estimatedMinutes: 8,
    targetSkills: ['Comprensión semántica', 'Asociación palabra-imagen', 'Vocabulario'],
    recommendedFor: ['TEL', 'Dislexia', 'Retraso del lenguaje', '5-9 años'],
    adaptiveConfig: { initialTimeLimit: 20, initialTargetSize: 'large', maxDistractions: 2 },
    tasks: [
      {
        title: 'Une perro con 🐕',
        description: 'Emparejamiento palabra-imagen directo',
        type: 'match',
        config: {
          instructionText: 'Arrastra la palabra PERRO hasta el perrito.',
          successFeedback: '¡Correcto! Perro = 🐕',
          timeLimitSeconds: 15,
          attemptsAllowed: 3,
          targetEmoji: '🐕',
        },
      },
      {
        title: 'Une feliz con 😊',
        description: 'Emparejamiento emocional',
        type: 'match',
        config: {
          instructionText: '¿Cómo se siente feliz? Arrastra hasta la carita.',
          successFeedback: '¡Feliz = 😊! Muy bien.',
          timeLimitSeconds: 15,
          attemptsAllowed: 3,
          targetEmoji: '😊',
        },
      },
      {
        title: 'Categorías: animal y fruta',
        description: 'Clasificación semántica',
        type: 'match',
        config: {
          instructionText: 'Coloca cada uno en su grupo: animal o fruta.',
          successFeedback: '¡Clasificación perfecta! Sabes mucho.',
          timeLimitSeconds: 20,
          attemptsAllowed: 4,
          targetEmoji: '📦',
        },
      },
    ],
  },
];

export function getTemplatesByCategory(categoryId: string): LevelTemplate[] {
  return LEVEL_TEMPLATES.filter((t) => t.category === categoryId);
}

export function getTemplateById(id: string): LevelTemplate | undefined {
  return LEVEL_TEMPLATES.find((t) => t.id === id);
}
