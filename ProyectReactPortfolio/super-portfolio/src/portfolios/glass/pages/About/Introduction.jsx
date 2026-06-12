// @ts-nocheck
import React from "react";
import styles from "../../styles/components/about/introduction.module.css";

export default function Introduction() {
  return (
    <section className={styles.introduction} aria-labelledby="about-title">

      <header className={styles.header}>
        <h2 id="about-title" className={styles.sectionTitle}>
          Sobre mí
        </h2>

        <span className={styles.roleBadge}>
          Full Stack Developer
        </span>
      </header>

      <div className={styles.textContent}>

        <p className={styles.lead}>
          Soy <span className={styles.highlight}>Carlos de Petronila Rodríguez</span>, 
          desarrollador especializado en construir productos digitales 
          <strong> escalables, eficientes y centrados en el usuario</strong>.
        </p>

        <p className={styles.body}>
          Trabajo principalmente con <span className={styles.highlight}>React</span>, 
          <span className={styles.highlight}> TypeScript</span>, 
          <span className={styles.highlight}> Node.js</span> y 
          <span className={styles.highlight}> MongoDB</span>, 
          aplicando arquitectura limpia, buenas prácticas de versionado y testing básico.
        </p>

        <div className={styles.corePoints}>
          <div className={styles.point}>
            <span className={styles.pointTitle}>Código limpio</span>
            <span className={styles.pointDesc}>Optimización y mantenibilidad</span>
          </div>

          <div className={styles.point}>
            <span className={styles.pointTitle}>Arquitectura</span>
            <span className={styles.pointDesc}>Escalabilidad y patrones sólidos</span>
          </div>

          <div className={styles.point}>
            <span className={styles.pointTitle}>Colaboración</span>
            <span className={styles.pointDesc}>Scrum · Kanban · Trabajo en equipo</span>
          </div>
        </div>

        <div className={styles.techStack}>
          <span>React + TypeScript</span>
          <span>Node / Express</span>
          <span>MongoDB</span>
          <span>Next.js</span>
          <span>Tailwind</span>
        </div>

        <p className={styles.note}>
          Actualmente profundizando en <strong>arquitecturas escalables</strong> y 
          <strong> DevOps</strong>, con enfoque en despliegues y CI/CD.
        </p>

      </div>
    </section>
  );
}
