// @ts-nocheck
import React from 'react';
import styles from "../../styles/components/curriculum/sumary.module.css"; 

function SummaryObjective() {
  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>Perfil Profesional</h2> 
      <p className={styles.summaryText}> 
        Desarrollador web Full Stack de 24 años con experiencia en la creación de 
        aplicaciones modernas utilizando tecnologías como <strong>React, Node.js, Express y MongoDB</strong>. 
        Apasionado por la programación y el aprendizaje continuo, disfruto enfrentando nuevos retos 
        y aplicando buenas prácticas de desarrollo. Me caracterizo por mi <strong>capacidad de trabajo en equipo, 
        comunicación clara y enfoque en resultados</strong>, contribuyendo a un entorno colaborativo y productivo. 
        Busco consolidar mi carrera en el área del desarrollo web aportando soluciones innovadoras, 
        escalables y centradas en la experiencia de usuario.
      </p>
    </div>
  );
}

export default SummaryObjective;
