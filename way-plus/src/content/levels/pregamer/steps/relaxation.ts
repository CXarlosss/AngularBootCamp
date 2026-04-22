import type { Step } from '@/core/engine/types';
import calmPicto from '@/shared/assets/calm.png';
import happyPicto from '@/shared/assets/happy.png';
import angryPicto from '@/shared/assets/angry.png';

export const relaxationStep: Step = {
  id: 'step-relaxation-1',
  levelId: 'pregamer',
  title: 'Relajación',
  theme: 'relaxation',
  ways: [
    {
      id: 'way-breathing-1',
      stepId: 'step-relaxation-1',
      type: 'double-choice',
      order: 1,
      stimulus: {
        image: calmPicto,
        text: '¿Cómo nos sentimos cuando respiramos despacio?',
      },
      options: [
        {
          id: 'opt-happy',
          image: happyPicto,
          label: 'Feliz',
          isCorrect: true,
          feedback: {
            visual: 'happy',
          },
        },
        {
          id: 'opt-angry',
          image: angryPicto,
          label: 'Enfadado',
          isCorrect: false,
          feedback: {
            visual: 'sad',
          },
        },
      ],
      metadata: {
        skillTag: 'emotional.regulation',
        difficulty: 1,
        estimatedTime: 10,
      },
    },
  ],
};
