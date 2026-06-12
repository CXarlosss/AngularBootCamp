// @ts-nocheck
// @ts-ignore
import React from 'react';
// @ts-ignore
import styles from "../../styles/components/curriculum/skillList.module.css"; // Correcto: skillList.module.css

function SkillsList() {
  const skills = {
    'Front-end': [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Redux',
      'Vue.js', 'Svelte', 'Web Components', 'LitElement', 'Next.js', 'Tailwind CSS'
    ],
    'Back-end': [
      'Node.js', 'Express.js', 'MongoDB', 'SQL', 'Firebase', 'RESTful APIs'
    ],
    'Control de Versiones y Herramientas': [
      'Git', 'GitHub', 'VS Code', 'Docker (básico)'
    ],
    'Metodologías y Conceptos': [
      'Metodologías Ágiles (Scrum, Kanban)', 'POO (Programación Orientada a Objetos)', 'Principios SOLID', 'Clean Code', 'Pruebas Unitarias'
    ],
    'Otros': [
      'Diseño Responsivo', 'UX/UI (conceptos básicos)', 'Optimización de Rendimiento', 'Despliegue (Netlify, Vercel)'
    ]
  };

  return (
    <div className={styles.skills}>
      <h2 className={styles.mainTitle}>Competencias Técnicas</h2>
      <div className={styles.skillsCategoriesContainer}> {/* Nuevo contenedor para las categorías */}
        {Object.keys(skills).map((category, index) => (
          <div key={index} className={styles.skillsCategory}> {/* Cada categoría es una tarjeta */}
            <h3>{category}</h3>
            <ul className={styles.skillsList}>
              {skills[category].map((skill, i) => (
                <li key={i} className={styles.skillItem}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsList;
