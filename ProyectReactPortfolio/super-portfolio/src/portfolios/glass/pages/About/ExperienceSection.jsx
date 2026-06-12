// @ts-nocheck
import React from "react";
import styles from "../../styles/components/about/experienceSection.module.css";
import experience from "../../../../data/About/About-experience";

function ExperienceItem({ item }) {
  return (
    <article className={styles.experienceItem}>
      <div className={styles.timelineDot} />

      <div className={styles.experienceCard}>
        <header className={styles.header}>
          <div>
            <h3 className={styles.experienceTitle}>{item.title}</h3>
            <p className={styles.experienceCompany}>{item.company}</p>
          </div>

          <span className={styles.experienceDates}>
            <time dateTime={item.start.dateTime}>{item.start.label}</time>
            {" – "}
            <time dateTime={item.end.dateTime}>{item.end.label}</time>
          </span>
        </header>

        <ul className={styles.experienceList}>
          {item.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ExperienceSection() {
  return (
    <section className={styles.experienceSection}>
      <h2 className={styles.sectionTitle}>Experiencia Laboral</h2>

      <div className={styles.timeline}>
        {experience.map((item) => (
          <ExperienceItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
