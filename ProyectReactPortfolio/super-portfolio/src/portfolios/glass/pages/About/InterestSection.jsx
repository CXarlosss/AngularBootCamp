// @ts-nocheck
import React from "react";
import styles from "../../styles/components/about/interestsSection.module.css";
import interests from "../../../../data/About/About-interest";

export default function InterestsSection() {
  return (
    <section
      className={styles.interestsSection}
      aria-labelledby="interests-title"
    >
      <header className={styles.sectionHeader}>
        <h2 id="interests-title" className={styles.sectionTitle}>
          Intereses
        </h2>

        <p className={styles.introText}>
          Actividades que fortalecen mi disciplina, creatividad y enfoque.
        </p>
      </header>

      <div className={styles.interestsGrid} role="list">
        {interests.map(({ name, icon: Icon, desc }) => (
          <article
            key={name}
            className={styles.interestCard}
            role="listitem"
          >
            <div className={styles.cardTop}>
              <Icon className={styles.interestIcon} />
              <h3 className={styles.interestName}>{name}</h3>
            </div>

            <p className={styles.interestDescription}>{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
