// @ts-nocheck
import styles from "../styles/playground.curriculum.module.css";

const Curriculum = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Professional Profile</h1>

      {/* CORE STACK */}
      <section className={styles.section}>
        <h2>Core Stack</h2>
        <ul>
          <li>React & React Router v6</li>
          <li>Next.js (App Router)</li>
          <li>TypeScript</li>
          <li>Node.js & Express</li>
          <li>MongoDB</li>
          <li>Tailwind CSS & CSS Modules</li>
        </ul>
      </section>

      {/* FRONTEND ARCHITECTURE */}
      <section className={styles.section}>
        <h2>Frontend Architecture</h2>
        <ul>
          <li>Multi-layout portfolio systems</li>
          <li>Isolated visual universes</li>
          <li>Component-driven architecture</li>
          <li>Scalable folder structures</li>
          <li>State-driven UI systems</li>
        </ul>
      </section>

      {/* PROJECT EXPERIENCE */}
      <section className={styles.section}>
        <h2>Project Experience</h2>
        <ul>
          <li>LocalMarket – Award-winning full-stack platform</li>
          <li>OP_Task – Project & task management system</li>
          <li>Professional Nutrition Website – Next.js SEO-driven platform</li>
          <li>Multiple React + TypeScript production apps</li>
        </ul>
      </section>

      {/* ENGINEERING PRINCIPLES */}
      <section className={styles.section}>
        <h2>Engineering Principles</h2>
        <ul>
          <li>Separation of concerns</li>
          <li>Clean and maintainable code</li>
          <li>Performance-first mindset</li>
          <li>Reusable and modular systems</li>
          <li>Production-ready architecture</li>
        </ul>
      </section>

      {/* EDUCATION */}
      <section className={styles.section}>
        <h2>Education</h2>
        <ul>
          <li>Full Stack Web Development – Neoland</li>
          <li>42 Madrid – Software Engineering</li>
        </ul>
      </section>
    </div>
  );
};

export default Curriculum;
