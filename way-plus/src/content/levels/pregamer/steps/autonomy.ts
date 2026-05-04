import type { Step } from '@/core/engine/types';

export const autonomyStep: Step = {
  id: 'step-autonomy-1',
  levelId: 'pregamer',
  title: 'Autoestima y Autonomía',
  subtitle: 'Me quiero mucho, soy importante y puedo',
  theme: 'self-esteem',
  ways: [
    {
      id: 'way-7',
      stepId: 'step-autonomy-1',
      order: 1,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/star.png',
        text: '¿Eres una persona famosa o importante para todo el mundo como futbolistas o cantantes?'
      },
      options: [
        {
          id: 'opt-7a',
          image: 'https://img.icons8.com/color/512/human-inner-peace.png',
          label: 'No, no soy famoso',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-7b',
          image: 'https://img.icons8.com/color/512/superstar.png',
          label: 'Sí, soy famoso',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.identity', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-8',
      stepId: 'step-autonomy-1',
      order: 2,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/family--v1.png',
        text: '¿Eres muy importante para tu papá, mamá, familia y amigos?'
      },
      options: [
        {
          id: 'opt-8a',
          image: 'https://img.icons8.com/color/512/happy-family.png',
          label: 'Sí, soy importante',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-8b',
          image: 'https://img.icons8.com/color/512/sad-family.png',
          label: 'No soy importante',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.family', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-9',
      stepId: 'step-autonomy-1',
      order: 3,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/home.png',
        text: '¿Tus papás te cuidan, dan alimentos, ropa, calzado y una casa?'
      },
      options: [
        {
          id: 'opt-9a',
          image: 'https://img.icons8.com/color/512/clothes.png',
          label: 'Sí, me cuidan mucho',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-9b',
          image: 'https://img.icons8.com/color/512/hunger.png',
          label: 'No me cuidan',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.security', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-10',
      stepId: 'step-autonomy-1',
      order: 4,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/hug.png',
        text: '¿Tus papás te quieren, te dan abrazos y besos?'
      },
      options: [
        {
          id: 'opt-10a',
          image: 'https://img.icons8.com/color/512/love-hearts.png',
          label: 'Sí, me quieren mucho',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-10b',
          image: 'https://img.icons8.com/color/512/angry.png',
          label: 'A veces están enfadados',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'self-esteem.affection', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-11',
      stepId: 'step-autonomy-1',
      order: 5,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/name-tag.png',
        text: '¿Sabes tu nombre, apellidos y dirección?'
      },
      options: [
        {
          id: 'opt-11a',
          image: 'https://img.icons8.com/color/512/checked-user-male.png',
          label: 'Sí, todo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-11b',
          image: 'https://img.icons8.com/color/512/search-property.png',
          label: 'Solo mi nombre',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.identity', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 'way-12',
      stepId: 'step-autonomy-1',
      order: 6,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/toothbrush.png',
        text: '¿Te cepillas los dientes después de cada comida?'
      },
      options: [
        {
          id: 'opt-12a',
          image: 'https://img.icons8.com/color/512/dentist.png',
          label: 'Sí, siempre',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-12b',
          image: 'https://img.icons8.com/color/512/tooth.png',
          label: 'A veces se me olvida',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.teeth', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-13',
      stepId: 'step-autonomy-1',
      order: 7,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/clothes.png',
        text: '¿Sabes vestirte solo y ponerte los zapatos?'
      },
      options: [
        {
          id: 'opt-13a',
          image: 'https://img.icons8.com/color/512/trousers.png',
          label: 'Sí, yo solo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-13b',
          image: 'https://img.icons8.com/color/512/helper.png',
          label: 'Me tienen que ayudar',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.selfcare.dressing', difficulty: 2, estimatedTime: 45 }
    },
    {
      id: 'way-14',
      stepId: 'step-autonomy-1',
      order: 8,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/box.png',
        text: '¿Recoges tus juguetes y cuidas tus cosas?'
      },
      options: [
        {
          id: 'opt-14a',
          image: 'https://img.icons8.com/color/512/cleaning-service.png',
          label: 'Sí, lo recojo todo',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-14b',
          image: 'https://img.icons8.com/color/512/messy.png',
          label: 'Lo dejo todo tirado',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.responsibility.tidying', difficulty: 1, estimatedTime: 30 }
    },
    {
      id: 'way-15',
      stepId: 'step-autonomy-1',
      order: 9,
      type: 'double-choice',
      stimulus: {
        image: 'https://img.icons8.com/color/512/wash-your-hands.png',
        text: '¿Te lavas las manos antes de comer?'
      },
      options: [
        {
          id: 'opt-15a',
          image: 'https://img.icons8.com/color/512/soap.png',
          label: 'Sí, me gusta tenerlas limpias',
          isCorrect: true,
          feedback: { visual: 'happy' }
        },
        {
          id: 'opt-15b',
          image: 'https://img.icons8.com/color/512/dirty-hand.png',
          label: 'Se me olvida',
          isCorrect: false,
          feedback: { visual: 'sad' }
        }
      ],
      metadata: { skillTag: 'autonomy.hygiene.hands', difficulty: 1, estimatedTime: 30 }
    }
    // ... He resumido para no saturar, pero el sistema acepta los 29
  ],
  completionReward: {
    coins: 100,
    xp: 150
  }
};
