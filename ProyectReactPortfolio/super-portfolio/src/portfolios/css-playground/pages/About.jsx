// @ts-nocheck
import styles from "../styles/playground.about.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.hero}>
        <h1>About This Lab</h1>
        <p>
          CSS Playground is not just a visual experiment. It is a structured
          environment designed to prototype, validate and refine advanced UI
          systems before integrating them into production-grade projects.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Purpose</h2>
        <p>
          As a Full Stack Developer specialized in React and scalable
          frontend architectures, I use this lab to test layout engines,
          animation orchestration and visual performance strategies in
          isolation.
        </p>
        <p>
          Every experiment here is a controlled prototype — a step before
          real-world implementation.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Core Focus Areas</h2>
        <ul>
          <li>Advanced CSS Grid & Layout Engines</li>
          <li>Dynamic UI Composition</li>
          <li>Animation Architecture & Timing Systems</li>
          <li>Performance-aware Visual Rendering</li>
          <li>Modular & Scalable UI Structures</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Engineering Approach</h2>
        <ul>
          <li>Component isolation using CSS Modules</li>
          <li>State-driven layout manipulation</li>
          <li>Clean routing architecture</li>
          <li>Separation of concerns</li>
          <li>Production-first mindset</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
