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
    },
    {
      id: "gamer-seq-2",
      stepId: "step-gamer-executive",
      order: 4,
      type: "sequencing",
      stimulus: {
        image: "https://img.icons8.com/color/512/shower.png",
        text: "¿Cuál es el orden para ducharte solo? Pon los pasos en orden:"
      },
      options: [
        { id: "d1", image: "https://img.icons8.com/color/512/t-shirt.png", label: "Quitar ropa", order: 0 },
        { id: "d2", image: "https://img.icons8.com/color/512/shower.png", label: "Mojarse", order: 1 },
        { id: "d3", image: "https://img.icons8.com/color/512/shampoo.png", label: "Jabón y champú", order: 2 },
        { id: "d4", image: "https://img.icons8.com/color/512/faucet.png", label: "Aclararse", order: 3 },
        { id: "d5", image: "https://img.icons8.com/color/512/towel.png", label: "Secarse", order: 4 },
        { id: "d6", image: "https://img.icons8.com/color/512/pajamas.png", label: "Ponerse pijama", order: 5 },
      ] as any,
      metadata: { skillTag: "executive.sequencing.hygiene", difficulty: 3, estimatedTime: 120 }
    },
    {
      id: "gamer-seq-3",
      stepId: "step-gamer-executive",
      order: 5,
      type: "sequencing",
      stimulus: {
        image: "https://img.icons8.com/color/512/backpack.png",
        text: "¿Cómo preparas tu mochila para el cole? Ordena los pasos:"
      },
      options: [
        { id: "m1", image: "https://img.icons8.com/color/512/checklist.png", label: "Mirar horario", order: 0 },
        { id: "m2", image: "https://img.icons8.com/color/512/books.png", label: "Meter libros", order: 1 },
        { id: "m3", image: "https://img.icons8.com/color/512/pencil-case.png", label: "Meter estuche", order: 2 },
        { id: "m4", image: "https://img.icons8.com/color/512/sandwich.png", label: "Meter merienda", order: 3 },
        { id: "m5", image: "https://img.icons8.com/color/512/zipper.png", label: "Cerrar cremallera", order: 4 },
      ] as any,
      metadata: { skillTag: "executive.sequencing.organization", difficulty: 3, estimatedTime: 120 }
    }
  ],
  completionReward: { coins: 300, xp: 400, item: "cape-magic" }
};
