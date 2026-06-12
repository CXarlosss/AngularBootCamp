// @ts-nocheck
import React from "react";
import styles from "../../styles/components/about/educationSection.module.css";
import education from "../../../../data/About/About-experience";

function EducationItem({ item }) {
  return (
    <article
      className={styles.educationItem}
      itemScope
      itemType="https://schema.org/EducationalOccupationalCredential"
    >
      <div className={styles.timelineMarker} />

      <div className={styles.educationCard}>
        <header className={styles.educationHeader}>
          <div>
            <h3 className={styles.educationTitle} itemProp="name">
              {item.title}
            </h3>
            <p className={styles.educationOrg} itemProp="recognizedBy">
              {item.org}
            </p>
          </div>

          <span className={styles.educationDate}>
            <time dateTime={item.start.dateTime}>{item.start.label}</time>
            {" – "}
            <time dateTime={item.end.dateTime}>{item.end.label}</time>
          </span>
        </header>

        <ul className={styles.educationList}>
          {item.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {item.skills?.length > 0 && (
          <div className={styles.skills}>
            {item.skills.map((skill) => (
              <span key={skill} className={styles.skillPill}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function EducationSection() {
  return (
    <section
      className={styles.educationSection}
      aria-labelledby="education-title"
    >
      <h2 id="education-title" className={styles.sectionTitle}>
        Formación Académica
      </h2>

      <div className={styles.timeline}>
        {education.map((item) => (
          <EducationItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
