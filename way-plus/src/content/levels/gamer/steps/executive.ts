import type { Step } from '@/core/engine/types';

export const executiveStep: Step = {
  id: "step-gamer-executive",
  levelId: "gamer",
  title: "Súper Secuencias",
  subtitle: "Ordena, recuerda y conecta",
  theme: "executive",
  ways: [
    {
      id: "gamer-seq-1",
      stepId: "step-gamer-executive",
      order: 1,
      type: "sequencing",
      stimulus: {
        image: "https://img.icons8.com/color/512/hand-wash.png",
        text: "¿Cómo te lavas las manos? Pon los pasos en orden:"
      },
      options: [
        { id: "s1", image: "https://img.icons8.com/color/512/bar-of-soap.png", label: "Jabón", order: 1 },
        { id: "s2", image: "https://img.icons8.com/color/512/faucet.png", label: "Agua", order: 0 },
        { id: "s3", image: "https://img.icons8.com/color/512/towel.png", label: "Secar", order: 3 },
        { id: "s4", image: "https://img.icons8.com/color/512/wash-your-hands.png", label: "Frotar", order: 2 },
      ] as any,
      metadata: { skillTag: "executive.sequencing.hygiene", difficulty: 2, estimatedTime: 90 }
    },
    {
      id: "gamer-mem-1",
      stepId: "step-gamer-executive",
      order: 2,
      type: "memory",
      stimulus: { text: "Encuentra las caras que sienten lo mismo" },
      options: [
        { id: "happy", pairId: "happy", image: "https://img.icons8.com/color/512/happy--v1.png" },
        { id: "sad", pairId: "sad", image: "https://img.icons8.com/color/512/sad--v1.png" },
        { id: "angry", pairId: "angry", image: "https://img.icons8.com/color/512/angry--v1.png" },
      ] as any,
      metadata: { skillTag: "emotional.memory.recognition", difficulty: 2, estimatedTime: 120 }
    },
    {
      id: "gamer-trace-1",
      stepId: "step-gamer-executive",
      order: 3,
      type: "tracing",
      stimulus: { 
        image: "https://img.icons8.com/color/512/toothbrush.png", 
        text: "Lleva el cepillo hasta los dientes" 
      },
      startPoint: { x: 20, y: 80 },
      options: [
        { id: "teeth", image: "https://img.icons8.com/color/512/teeth.png", label: "Dientes", isCorrect: true, position: { x: 80, y: 20 } },
        { id: "shoes", image: "https://img.icons8.com/color/512/shoes.png", label: "Zapatos", isCorrect: false, position: { x: 80, y: 80 } },
      ] as any,
      metadata: { skillTag: "motor.tracing.daily", difficulty: 1, estimatedTime: 60 }
    }
  ],
  completionReward: { coins: 200, xp: 250, item: "cape-magic" }
};
