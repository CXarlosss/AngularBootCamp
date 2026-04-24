/**
 * Logic to generate human-readable recommendations for parents
 * based on clinical radar data.
 */

import { CompetencyScores, Imbalance } from '../../therapist/utils/clinicalRadarUtils';

export interface ParentRecommendation {
  id: string;
  category: string;
  icon: string;
  title: string;
  advice: string;
  priority: 'low' | 'medium' | 'high';
}

export function generateRecommendations(scores: CompetencyScores, imbalances: Imbalance[]): ParentRecommendation[] {
  const recommendations: ParentRecommendation[] = [];

  // 1. Check for critical imbalances
  imbalances.forEach(imb => {
    if (imb.type === 'danger') {
      recommendations.push({
        id: `imb-${imb.areaA}-${imb.areaB}`,
        category: 'Equilibrio',
        icon: '⚖️',
        title: `Prioridad: Equilibrar ${imb.areaA}`,
        advice: `Se observa que ${imb.areaA} está muy por debajo de otras áreas. Intenta reforzar pequeñas acciones de esta área en el día a día.`,
        priority: 'high'
      });
    }
  });

  // 2. Score-based recommendations
  if (scores.regulation < 40) {
    recommendations.push({
      id: 'low-reg',
      category: 'Calma',
      icon: '🧘',
      title: 'Momento de calma',
      advice: 'Esta semana el progreso en relajación ha sido lento. Dediquen 2 minutos a respirar juntos antes de las comidas.',
      priority: 'medium'
    });
  }

  if (scores.social < 50) {
    recommendations.push({
      id: 'low-social',
      category: 'Social',
      icon: '🤝',
      title: 'Reto de conexión',
      advice: 'Anímale a compartir una anécdota del colegio hoy en la cena para practicar la apertura social.',
      priority: 'medium'
    });
  }

  if (scores.autonomy > 80) {
    recommendations.push({
      id: 'high-aut',
      category: 'Autonomía',
      icon: '🌟',
      title: '¡Súper independiente!',
      advice: 'Está demostrando mucha iniciativa. Es un buen momento para darle una pequeña responsabilidad nueva en casa.',
      priority: 'low'
    });
  }

  // Default if everything is balanced
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'keep-going',
      category: 'General',
      icon: '🚀',
      title: '¡Buen ritmo!',
      advice: 'El progreso es equilibrado. Sigan manteniendo las rutinas de la app como hasta ahora.',
      priority: 'low'
    });
  }

  return recommendations;
}
