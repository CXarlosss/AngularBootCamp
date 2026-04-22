import type { Step } from '@/core/engine/types';

export const assertivenessStep: Step = {
  id: "step-3-assertiveness",
  levelId: "pregamer",
  title: "Autoestima y Asertividad",
  subtitle: "Me quiero mucho, me siento seguro y respeto a los demás",
  theme: "assertiveness",
  ways: [
    {
      id: "way-36",
      stepId: "step-3-assertiveness",
      order: 1,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/door.png",
        text: "¿Llamas a la puerta y pides permiso para entrar?"
      },
      options: [
        {
          id: "opt-36a",
          image: "https://img.icons8.com/color/512/knock-at-the-door.png",
          label: "Sí llamo y pregunto",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "opt-36b",
          image: "https://img.icons8.com/color/512/door.png",
          label: "Entro sin preguntar",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "assertiveness.boundaries.knock", difficulty: 1, estimatedTime: 30 }
    },
    {
      id: "way-37",
      stepId: "step-3-assertiveness",
      order: 2,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/helping-hand.png",
        text: "¿Haces favores y ayudas a otros que te lo piden?"
      },
      options: [
        {
          id: "opt-37a",
          image: "https://img.icons8.com/color/512/volunteer.png",
          label: "Sí, ayudo a los demás",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "opt-37b",
          image: "https://img.icons8.com/color/512/selfish.png",
          label: "No ayudo ni hago favores",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "assertiveness.empathy.help", difficulty: 1, estimatedTime: 30 }
    },
    {
      id: "way-38",
      stepId: "step-3-assertiveness",
      order: 3,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/children.png",
        text: "¿Juegas con niños y niñas?"
      },
      options: [
        {
          id: "opt-38a",
          image: "https://img.icons8.com/color/512/friends.png",
          label: "Sí, juego mucho con otros",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "opt-38b",
          image: "https://img.icons8.com/color/512/sad-man.png",
          label: "Juego yo solo sin nadie",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "assertiveness.social.play", difficulty: 1, estimatedTime: 30 }
    },
    {
      id: "way-41",
      stepId: "step-3-assertiveness",
      order: 6,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/shield.png",
        text: "¿Cómo te defiendes si se meten contigo o te acusan de algo mentira?"
      },
      options: [
        {
          id: "opt-41a",
          image: "https://img.icons8.com/color/512/speaking.png",
          label: "Les digo que me dejen en paz y me voy",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "opt-41b",
          image: "https://img.icons8.com/color/512/fight.png",
          label: "Les grito, pego o empujo",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "assertiveness.conflict.defense", difficulty: 2, estimatedTime: 45 }
    }
    // ... Los demás se integran siguiendo este patrón escalable
  ],
  completionReward: {
    coins: 150,
    xp: 200,
    item: "hat-wizard"
  }
};
