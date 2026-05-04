import type { Step } from '@/core/engine/types';

export const inhibitionStep: Step = {
  id: "step-gamer-inhibition",
  levelId: "gamer",
  title: "Control de Impulsos",
  subtitle: "¡Piensa antes de actuar!",
  theme: "executive",
  ways: [
    {
      id: "gamer-inh-1",
      stepId: "step-gamer-inhibition",
      order: 1,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/traffic-light.png",
        text: "Semáforo: Si está en ROJO, ¿qué tienes que hacer?"
      },
      options: [
        {
          id: "i1a",
          image: "https://img.icons8.com/color/512/stop.png",
          label: "Me quedo quieto como una estatua",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "i1b",
          image: "https://img.icons8.com/color/512/running.png",
          label: "Sigo corriendo rápido",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.inhibition.traffic", difficulty: 1, estimatedTime: 30 }
    },
    {
      id: "gamer-inh-2",
      stepId: "step-gamer-inhibition",
      order: 2,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/shouting.png",
        text: "Tienes muchas ganas de decir algo en clase, pero la profe está hablando. ¿Qué haces?"
      },
      options: [
        {
          id: "i2a",
          image: "https://img.icons8.com/color/512/hand-up.png",
          label: "Levanto la mano y espero mi turno",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "i2b",
          image: "https://img.icons8.com/color/512/speak.png",
          label: "Lo digo gritando muy fuerte",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.inhibition.turn-taking", difficulty: 2, estimatedTime: 45 }
    },
    {
      id: "gamer-inh-3",
      stepId: "step-gamer-inhibition",
      order: 3,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/marshmallow.png",
        text: "El Reto del Caramelo: Si esperas a que vuelva mamá sin comerlo, ¡te dará dos! ¿Qué haces?"
      },
      options: [
        {
          id: "i3a",
          image: "https://img.icons8.com/color/512/clock.png",
          label: "Espero paciente para tener el premio doble",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "i3b",
          image: "https://img.icons8.com/color/512/candy.png",
          label: "Me lo como corriendo en cuanto se va",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.inhibition.delayed-gratification", difficulty: 3, estimatedTime: 60 }
    }
  ],
  completionReward: {
    coins: 250,
    xp: 350,
    item: "medal-gold"
  }
};
