// ============================================
// relaxation.ts
// GENERADO AUTOMÁTICAMENTE por wayGenerator.ts
// NO EDITAR MANUALMENTE — Modificar ways-master-data.ts y regenerar
// Fecha: 2026-06-22T19:20:29.189Z
// Ways incluidos: 6
// ============================================

import type { Step } from '@/core/engine/types';

export const relaxationStep: Step = {
  id: 'step-relaxation-1',
  levelId: 'pregamer',
  stepNumber: 1,
  title: 'STEP Relajación',
  theme: 'relaxation',
  ways: [
    {
      id: 's1-w1',
      name: 'Respiración Profunda',
      stepId: 'step-relaxation-1',
      order: 1,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 1,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cómo nos sentimos cuando respiramos despacio?'
      },
      options: [
        {
          id: 's1-w1-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Feliz',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w1-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Enfadado',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'emotional.regulation', difficulty: 1, estimatedTime: 10 }
    },
    {
      id: 's1-w2',
      name: 'Respiro con la Barriga',
      stepId: 'step-relaxation-1',
      order: 2,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 2,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Pon tus manos en la barriga y coge aire muy despacio.'
      },
      options: [
        {
          id: 's1-w2-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Respiro despacio',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w2-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Respiro rápido',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'relaxation.breathing', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's1-w3',
      name: 'Aplasto la Nube',
      stepId: 'step-relaxation-1',
      order: 3,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 3,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Imagina que aprietas fuerte una nube y luego sueltas las manos.'
      },
      options: [
        {
          id: 's1-w3-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Aprieto y suelto',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w3-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Grito fuerte',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'relaxation.muscle', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's1-w4',
      name: 'Mi Lugar Seguro',
      stepId: 'step-relaxation-1',
      order: 4,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 4,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Cierra los ojos e imagina tu lugar favorito donde estás tranquilo.'
      },
      options: [
        {
          id: 's1-w4-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Pienso en mi lugar',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w4-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Pienso en cosas malas',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'relaxation.imagery', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's1-w5',
      name: '5 Cosas que Veo',
      stepId: 'step-relaxation-1',
      order: 5,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 5,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Mira a tu alrededor y busca 5 cosas que sean de color azul.'
      },
      options: [
        {
          id: 's1-w5-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Busco los colores',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w5-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Cierro los ojos',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'relaxation.grounding', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's1-w6',
      name: 'Bailar Despacio',
      stepId: 'step-relaxation-1',
      order: 6,
      type: 'double-choice',
      stepNumber: 1,
      wayNumber: 6,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Mueve los brazos muy despacio como si estuvieras flotando en el agua.'
      },
      options: [
        {
          id: 's1-w6-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Me muevo lento',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's1-w6-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Corro muy rápido',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'relaxation.movement', difficulty: 3, estimatedTime: 120 }
    }
  ],
  completionReward: {
    coins: 100,
    xp: 150
  }
};
