// ============================================
// assertiveness.ts
// GENERADO AUTOMÁTICAMENTE por wayGenerator.ts
// NO EDITAR MANUALMENTE — Modificar ways-master-data.ts y regenerar
// Fecha: 2026-07-01T19:12:03.059Z
// Ways incluidos: 22
// ============================================

import type { Step } from '@/core/engine/types';

export const assertivenessStep: Step = {
  id: 'step-assertiveness-1',
  levelId: 'pregamer',
  stepNumber: 3,
  title: 'STEP Asertividad y Autoestima',
  theme: 'assertiveness',
  ways: [
    {
      id: 's3-w1',
      name: 'Respetar el espacio de otros',
      stepId: 'step-assertiveness-1',
      order: 1,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 1,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Llamas a la puerta y pides permiso para entrar?'
      },
      options: [
        {
          id: 's3-w1-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí llamo y pregunto',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w1-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Entro sin preguntar',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.boundaries.knock', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's3-w2',
      name: 'Ayudar a los demás',
      stepId: 'step-assertiveness-1',
      order: 2,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 2,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Haces favores y ayudas a otros que te lo piden?'
      },
      options: [
        {
          id: 's3-w2-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, ayudo a los demás',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w2-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'No ayudo ni hago favores',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.empathy.help', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's3-w3',
      name: 'Jugar en grupo',
      stepId: 'step-assertiveness-1',
      order: 3,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 3,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Juegas con niños y niñas?'
      },
      options: [
        {
          id: 's3-w3-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, juego mucho con otros niños y niñas',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w3-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Juego yo solo sin nadie',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.social.play', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's3-w4',
      name: 'Digo No',
      stepId: 'step-assertiveness-1',
      order: 4,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 4,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Dices \'NO\' cuando algo no te gusta o te hace sentir mal?'
      },
      options: [
        {
          id: 's3-w4-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, digo lo que no me gusta',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w4-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me callo y me aguanto',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.boundaries.no', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 's3-w5',
      name: 'Pedir perdón',
      stepId: 'step-assertiveness-1',
      order: 5,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 5,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Pides perdón si haces algo mal o molestas a alguien sin querer?'
      },
      options: [
        {
          id: 's3-w5-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, pido perdón',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w5-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'No pido perdón nunca',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.responsibility.sorry', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's3-w6',
      name: 'Defenderse asertivamente',
      stepId: 'step-assertiveness-1',
      order: 6,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 6,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo te defiendes si se burlan de ti o te acusan de algo que es mentira?'
      },
      options: [
        {
          id: 's3-w6-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Les digo que me dejen en paz y me voy',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w6-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Les grito, pego o empujo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.conflict.defense', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 's3-w7',
      name: 'Decir que estoy enfadado',
      stepId: 'step-assertiveness-1',
      order: 7,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 7,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo le dices a un amigo que estás enfadado con él?'
      },
      options: [
        {
          id: 's3-w7-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Le hablo tranquilo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w7-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le doy un empujón',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.express.anger', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w8',
      name: 'Decir que estoy triste',
      stepId: 'step-assertiveness-1',
      order: 8,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 8,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si te sientes triste, ¿qué haces para sentirte mejor?'
      },
      options: [
        {
          id: 's3-w8-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Digo "Estoy triste"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w8-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Rompo el papel',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.express.sadness', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w9',
      name: 'Decir que estoy contento',
      stepId: 'step-assertiveness-1',
      order: 9,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 9,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Cuando estás contento, ¿cómo se lo dices a mamá?'
      },
      options: [
        {
          id: 's3-w9-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Le doy una sonrisa',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w9-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le tiro del pelo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.express.happiness', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's3-w10',
      name: 'Decir que tengo miedo',
      stepId: 'step-assertiveness-1',
      order: 10,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 10,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si tienes miedo de un perro grande, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w10-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Me pongo junto a papá',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w10-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Grito en la calle',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.express.fear', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's3-w11',
      name: 'No quiero jugar',
      stepId: 'step-assertiveness-1',
      order: 11,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 11,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si no quieres jugar a la pelota, ¿qué dices?'
      },
      options: [
        {
          id: 's3-w11-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"No, quiero jugar a otra cosa"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w11-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Quito la pelota',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.sayno.play', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w12',
      name: 'No me toques',
      stepId: 'step-assertiveness-1',
      order: 12,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 12,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si alguien te abraza y tú no quieres, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w12-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Digo "No quiero, suéltame"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w12-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le doy un golpe',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.sayno.touch', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's3-w13',
      name: 'No me gusta la broma',
      stepId: 'step-assertiveness-1',
      order: 13,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 13,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si un niño te hace una broma que no te gusta, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w13-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Le pido que pare',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w13-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Lloro en el suelo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.sayno.jokes', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w14',
      name: 'No quiero compartir hoy',
      stepId: 'step-assertiveness-1',
      order: 14,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 14,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si es tu juguete favorito y hoy no quieres prestarlo, ¿qué dices?'
      },
      options: [
        {
          id: 's3-w14-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"Hoy quiero jugar solo"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w14-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le quito el juguete',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.sayno.share', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's3-w15',
      name: 'Ayuda con la tarea',
      stepId: 'step-assertiveness-1',
      order: 15,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 15,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si no entiendes la tarea de matemáticas, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w15-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Levanto la mano y pido ayuda',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w15-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me quedo callado',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.help.homework', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's3-w16',
      name: 'Ayuda si me caigo',
      stepId: 'step-assertiveness-1',
      order: 16,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 16,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si te caes en el recreo y te duele, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w16-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Voy a buscar a un profesor',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w16-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me escondo en el baño',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.help.injury', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w17',
      name: 'Ayuda si pierdo algo',
      stepId: 'step-assertiveness-1',
      order: 17,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 17,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si pierdes tu mochila en el colegio, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w17-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Pido ayuda para buscarla',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w17-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Lloro sin decir nada',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.help.lost', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's3-w18',
      name: 'Hablar con la Profe',
      stepId: 'step-assertiveness-1',
      order: 18,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 18,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo le hablas a tu profesora cuando necesitas ir al baño?'
      },
      options: [
        {
          id: 's3-w18-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"Profe, ¿puedo ir al baño?"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w18-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Salgo de clase sin permiso',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.roleplay.teacher', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's3-w19',
      name: 'Hablar con Papá',
      stepId: 'step-assertiveness-1',
      order: 19,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 19,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo le pides a papá que juegue contigo?'
      },
      options: [
        {
          id: 's3-w19-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"Papá, ¿jugamos un rato?"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w19-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Tiro los juguetes',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.roleplay.parent', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's3-w20',
      name: 'Hablar con un Amigo',
      stepId: 'step-assertiveness-1',
      order: 20,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 20,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo le pides a un amigo jugar a las cartas?'
      },
      options: [
        {
          id: 's3-w20-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"¿Quieres jugar a las cartas?"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w20-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le quito sus juguetes',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.roleplay.friend', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's3-w21',
      name: 'Compartir Juguete',
      stepId: 'step-assertiveness-1',
      order: 21,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 21,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si los dos queréis el mismo juguete, ¿qué hacéis?'
      },
      options: [
        {
          id: 's3-w21-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Jugamos por turnos',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w21-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Peleamos por el juguete',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.conflict.share', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's3-w22',
      name: 'Defensa Propia',
      stepId: 'step-assertiveness-1',
      order: 22,
      type: 'double-choice',
      stepNumber: 3,
      wayNumber: 22,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si alguien te empuja a propósito en el patio, ¿qué haces?'
      },
      options: [
        {
          id: 's3-w22-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Le digo "Para" y busco un profe',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's3-w22-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Le pego muy fuerte',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'assertiveness.conflict.defense', difficulty: 3, estimatedTime: 120 }
    }
  ],
  completionReward: {
    coins: 100,
    xp: 150
  }
};
