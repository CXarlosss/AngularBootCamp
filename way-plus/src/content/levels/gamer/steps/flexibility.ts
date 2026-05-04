import type { Step } from '@/core/engine/types';

export const flexibilityStep: Step = {
  id: "step-gamer-flexibility",
  levelId: "gamer",
  title: "Flexibilidad Mental",
  subtitle: "¡Cambia el plan y sigue adelante!",
  theme: "executive",
  ways: [
    {
      id: "gamer-flex-1",
      stepId: "step-gamer-flexibility",
      order: 1,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/switch.png",
        text: "Íbamos al parque pero ha empezado a llover. ¿Qué podemos hacer ahora?"
      },
      options: [
        {
          id: "f1a",
          image: "https://img.icons8.com/color/512/home.png",
          label: "Jugar a juegos de mesa en casa",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "f1b",
          image: "https://img.icons8.com/color/512/crying.png",
          label: "Llorar y enfadarse todo el día",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.flexibility.situation", difficulty: 1, estimatedTime: 45 }
    },
    {
      id: "gamer-flex-2",
      stepId: "step-gamer-flexibility",
      order: 2,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/puzzles.png",
        text: "Tu pieza favorita del puzzle no encaja. ¿Qué intentas?"
      },
      options: [
        {
          id: "f2a",
          image: "https://img.icons8.com/color/512/rotate.png",
          label: "Giro la pieza o busco otra",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "f2b",
          image: "https://img.icons8.com/color/512/delete.png",
          label: "Tiro el puzzle al suelo",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.flexibility.problem-solving", difficulty: 2, estimatedTime: 45 }
    },
    {
      id: "gamer-flex-3",
      stepId: "step-gamer-flexibility",
      order: 3,
      type: "double-choice",
      stimulus: {
        image: "https://img.icons8.com/color/512/friends.png",
        text: "Tus amigos quieren jugar al pilla-pilla pero tú querías fútbol. ¿Qué haces?"
      },
      options: [
        {
          id: "f3a",
          image: "https://img.icons8.com/color/512/handshake.png",
          label: "Juego un rato al pilla-pilla con ellos",
          isCorrect: true,
          feedback: { visual: "happy" }
        },
        {
          id: "f3b",
          image: "https://img.icons8.com/color/512/angry.png",
          label: "Me voy solo y no juego con nadie",
          isCorrect: false,
          feedback: { visual: "sad" }
        }
      ],
      metadata: { skillTag: "executive.flexibility.social", difficulty: 2, estimatedTime: 60 }
    }
  ],
  completionReward: {
    coins: 200,
    xp: 300,
    item: "glasses-professor"
  }
};
