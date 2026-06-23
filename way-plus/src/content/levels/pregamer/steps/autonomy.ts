// ============================================
// autonomy.ts
// GENERADO AUTOMÁTICAMENTE por wayGenerator.ts
// NO EDITAR MANUALMENTE — Modificar ways-master-data.ts y regenerar
// Fecha: 2026-06-22T19:20:29.190Z
// Ways incluidos: 29
// ============================================

import type { Step } from '@/core/engine/types';

export const autonomyStep: Step = {
  id: 'step-autonomy-1',
  levelId: 'pregamer',
  stepNumber: 2,
  title: 'STEP Autonomía y Autoestima',
  theme: 'self-esteem',
  ways: [
    {
      id: 's2-w1',
      name: 'Valor Personal',
      stepId: 'step-autonomy-1',
      order: 1,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 1,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Crees que eres una persona valiosa y que haces cosas muy bien?'
      },
      options: [
        {
          id: 's2-w1-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, soy valioso!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w1-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'A veces dudo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.identity', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w2',
      name: 'Vínculo Familiar',
      stepId: 'step-autonomy-1',
      order: 2,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 2,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Sientes que eres una pieza fundamental e importante para tu familia?'
      },
      options: [
        {
          id: 's2-w2-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, me quieren!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w2-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'No estoy seguro',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.family', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w3',
      name: 'Cuidados y Seguridad',
      stepId: 'step-autonomy-1',
      order: 3,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 3,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Tus papás te cuidan dándote todo lo que necesitas para crecer sano?'
      },
      options: [
        {
          id: 's2-w3-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, me cuidan mucho',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w3-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'A veces falta algo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.security', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w4',
      name: 'Afecto y Cariño',
      stepId: 'step-autonomy-1',
      order: 4,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 4,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Recibes abrazos, besos y palabras bonitas de las personas que te quieren?'
      },
      options: [
        {
          id: 's2-w4-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, recibo mucho amor!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w4-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'A veces no tanto',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.affection', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w5',
      name: 'Identidad Propia',
      stepId: 'step-autonomy-1',
      order: 5,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 5,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Sabes decir con orgullo tu nombre, tus apellidos y dónde vives?'
      },
      options: [
        {
          id: 's2-w5-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, lo sé todo!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w5-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Solo mi nombre',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.identity', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 's2-w6',
      name: 'Higiene Dental',
      stepId: 'step-autonomy-1',
      order: 6,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 6,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Cuidas tu sonrisa cepillándote los dientes después de comer?'
      },
      options: [
        {
          id: 's2-w6-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, siempre!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w6-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'A veces se me olvida',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.teeth', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w7',
      name: 'Autocuidado: Vestirse',
      stepId: 'step-autonomy-1',
      order: 7,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 7,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Eres capaz de elegir tu ropa y vestirte tú solo?'
      },
      options: [
        {
          id: 's2-w7-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, yo puedo!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w7-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Necesito ayuda',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.selfcare.dressing', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 's2-w8',
      name: 'Responsabilidad',
      stepId: 'step-autonomy-1',
      order: 8,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 8,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Te haces cargo de tus juguetes y los recoges al terminar?'
      },
      options: [
        {
          id: 's2-w8-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, soy responsable!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w8-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me cuesta un poco',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.responsibility.tidying', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w9',
      name: 'Higiene de Manos',
      stepId: 'step-autonomy-1',
      order: 9,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 9,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Mantienes tus manos limpias lavándolas antes de cada comida?'
      },
      options: [
        {
          id: 's2-w9-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '¡Sí, manos limpias!',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w9-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Se me olvida',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.hands', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 's2-w10',
      name: 'Lavar los Dientes',
      stepId: 'step-autonomy-1',
      order: 10,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 10,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces después de comer para cuidar tus dientes?'
      },
      options: [
        {
          id: 's2-w10-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Me cepillo los dientes',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w10-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me voy a jugar',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.teeth', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w11',
      name: 'Peinar el Pelo',
      stepId: 'step-autonomy-1',
      order: 11,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 11,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué usas por la mañana para que tu pelo esté ordenado?'
      },
      options: [
        {
          id: 's2-w11-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Uso el peine',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w11-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Uso un lápiz',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.hair', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w12',
      name: 'Lavar las Manos',
      stepId: 'step-autonomy-1',
      order: 12,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 12,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Con qué te lavas las manos cuando están sucias?'
      },
      options: [
        {
          id: 's2-w12-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Agua y jabón',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w12-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Solo con agua',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.hands', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w13',
      name: 'Habitación Limpia',
      stepId: 'step-autonomy-1',
      order: 13,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 13,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Dónde pones la ropa sucia antes de ir a dormir?'
      },
      options: [
        {
          id: 's2-w13-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'En el cesto',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w13-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'En el suelo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.room', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w14',
      name: 'Hace Frío',
      stepId: 'step-autonomy-1',
      order: 14,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 14,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si hace mucho frío en la calle, ¿qué ropa te pones?'
      },
      options: [
        {
          id: 's2-w14-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Abrigo y bufanda',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w14-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Pantalón corto',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.dressing.weather', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w15',
      name: 'Elegir Ropa',
      stepId: 'step-autonomy-1',
      order: 15,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 15,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Quién elige la ropa que te pones para ir al parque?'
      },
      options: [
        {
          id: 's2-w15-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'La elijo yo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w15-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Espero a mamá',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.dressing.choice', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w16',
      name: 'Atar Cordones',
      stepId: 'step-autonomy-1',
      order: 16,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 16,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces si se te desatan los cordones de las zapatillas?'
      },
      options: [
        {
          id: 's2-w16-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Me los ato',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w16-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Sigo caminando',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.dressing.shoes', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's2-w17',
      name: 'El Desayuno',
      stepId: 'step-autonomy-1',
      order: 17,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 17,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Por la mañana, ¿te sientas en la mesa a tomar tu desayuno?'
      },
      options: [
        {
          id: 's2-w17-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sí, me siento a comer',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w17-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Como caminando',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.eating.breakfast', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w18',
      name: 'Beber Agua',
      stepId: 'step-autonomy-1',
      order: 18,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 18,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces si tienes mucha sed después de correr?'
      },
      options: [
        {
          id: 's2-w18-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Bebo un vaso de agua',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w18-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me aguanto la sed',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.eating.water', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w19',
      name: 'Comer Verdura',
      stepId: 'step-autonomy-1',
      order: 19,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 19,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces cuando hay una comida nueva en tu plato?'
      },
      options: [
        {
          id: 's2-w19-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'La pruebo un poco',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w19-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Lloro y no como',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.eating.newfood', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's2-w20',
      name: 'La Mochila',
      stepId: 'step-autonomy-1',
      order: 20,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 20,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué pones en la mochila para ir a una excursión?'
      },
      options: [
        {
          id: 's2-w20-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Mi almuerzo y agua',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w20-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Solo mis juguetes',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.eating.pack', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w21',
      name: 'Hora de Dormir',
      stepId: 'step-autonomy-1',
      order: 21,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 21,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces cuando es la hora de ir a dormir?'
      },
      options: [
        {
          id: 's2-w21-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Me pongo el pijama',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w21-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me quedo jugando',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.routines.sleep', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w22',
      name: 'Apagar la Tele',
      stepId: 'step-autonomy-1',
      order: 22,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 22,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces si papá te dice que es hora de apagar la tele?'
      },
      options: [
        {
          id: 's2-w22-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'La apago tranquilo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w22-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me enfado y grito',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.routines.screens', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w23',
      name: 'Guardar Juguetes',
      stepId: 'step-autonomy-1',
      order: 23,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 23,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces cuando terminas de jugar con tus bloques?'
      },
      options: [
        {
          id: 's2-w23-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Los guardo en la caja',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w23-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Los dejo tirados',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.routines.tidy', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w24',
      name: 'La Agenda',
      stepId: 'step-autonomy-1',
      order: 24,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 24,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Miras tu agenda o tu horario para saber qué toca hoy?'
      },
      options: [
        {
          id: 's2-w24-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Miro mi agenda',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w24-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'No miro nada',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.routines.schedule', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w25',
      name: 'Estoy Enfadado',
      stepId: 'step-autonomy-1',
      order: 25,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 25,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces cuando te sientes muy enfadado en casa?'
      },
      options: [
        {
          id: 's2-w25-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Respiro y me calmo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w25-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Tiro los juguetes',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.emotions.anger', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w26',
      name: 'Estoy Triste',
      stepId: 'step-autonomy-1',
      order: 26,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 26,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces si te sientes triste y con ganas de llorar?'
      },
      options: [
        {
          id: 's2-w26-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Pido un abrazo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w26-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Me escondo solo',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.emotions.sadness', difficulty: 2, estimatedTime: 90 }
    },
    {
      id: 's2-w27',
      name: 'Estoy Contento',
      stepId: 'step-autonomy-1',
      order: 27,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 27,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces cuando estás muy feliz porque vamos al parque?'
      },
      options: [
        {
          id: 's2-w27-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Sonrío y salto un poco',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w27-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Grito muy fuerte',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.emotions.happiness', difficulty: 1, estimatedTime: 60 }
    },
    {
      id: 's2-w28',
      name: 'Tengo Miedo',
      stepId: 'step-autonomy-1',
      order: 28,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 28,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '¿Qué haces si te asustas mucho con un ruido fuerte?'
      },
      options: [
        {
          id: 's2-w28-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: 'Digo "Me asusté"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w28-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: 'Salgo corriendo sin mirar',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.emotions.fear', difficulty: 3, estimatedTime: 120 }
    },
    {
      id: 's2-w29',
      name: 'Pensamiento Positivo',
      stepId: 'step-autonomy-1',
      order: 29,
      type: 'double-choice',
      stepNumber: 2,
      wayNumber: 29,
      stimulus: {
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: 'Si un dibujo no te sale bien, ¿qué te dices a ti mismo?'
      },
      options: [
        {
          id: 's2-w29-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '"Puedo intentarlo otra vez"',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 's2-w29-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: '"Soy un desastre"',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.selfesteem.resilience', difficulty: 3, estimatedTime: 120 }
    }
  ],
  completionReward: {
    coins: 100,
    xp: 150
  }
};
