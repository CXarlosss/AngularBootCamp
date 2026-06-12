// @ts-nocheck
import React from "react";
import styles from "../../styles/components/about/skillsSection.module.css";

export default function SkillsSection() {
  return (
    <section className={styles.skillsSection} aria-labelledby="skills-title">
      <header className={styles.sectionHeader}>
        <h2 id="skills-title" className={styles.sectionTitle}>
          Tech Stack
        </h2>
        <span className={styles.badge}>Core Skills</span>
      </header>

      <div className={styles.skillsGrid}>

        <div className={styles.skillCategory}>
          <h3>Front-end</h3>
          <div className={styles.tags}>
            <span>HTML</span>
            <span>CSS</span>
            <span>JavaScript</span>
            <span>React</span>
            <span>Redux</span>
            <span>LitElement</span>
            <span>Vue</span>
            <span>Svelte</span>
          </div>
        </div>

        <div className={styles.skillCategory}>
          <h3>Back-end</h3>
          <div className={styles.tags}>
            <span>Node.js</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>Mongoose</span>
            <span>SQL</span>
          </div>
        </div>

        <div className={styles.skillCategory}>
          <h3>Versioning</h3>
          <div className={styles.tags}>
            <span>Git</span>
            <span>GitHub</span>
          </div>
        </div>

        <div className={styles.skillCategory}>
          <h3>Other</h3>
          <div className={styles.tags}>
            <span>Bootstrap</span>
            <span>Firebase</span>
            <span>Scrum</span>
            <span>Kanban</span>
          </div>
        </div>

      </div>
    </section>
  );
}
