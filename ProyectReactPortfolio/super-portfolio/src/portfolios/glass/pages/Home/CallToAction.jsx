// @ts-nocheck
import React from 'react';
import styles from '../../styles/components/home/callToAction.module.css';
import Button from '../../common/Button';

function CallToAction() {
  return (
    <section className={styles.callToAction}>
      <span className={styles.kicker}>Tu próximo aliado en desarrollo web</span>
      <h2>¿Listo para trabajar juntos?</h2>
      <p className={styles.intro}>
        Soy un desarrollador web con pasión por crear experiencias digitales modernas, 
        eficientes y centradas en el usuario. Me encanta transformar ideas en proyectos 
        funcionales que aporten valor real.
      </p>
      <p>
        Si tienes alguna pregunta o quieres discutir un proyecto, no dudes en ponerte
        en contacto conmigo. ¡Estoy emocionado de colaborar contigo!
      </p>
      <div className={styles.ctaButtons}>
        <Button link="/contact" className={styles.ctaButton}>
          ✉️ Contáctame
        </Button>
        <Button link="/projects" className={`${styles.ctaButton} ${styles.ctaButtonSecondary}`}>
          🚀 Ver proyectos
        </Button>
      </div>
    </section>
  );
}

export default CallToAction;
