// @ts-nocheck
import React from "react";
import Introduction from "./Introduction";
import SkillsSection from "./SkillsSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import InterestsSection from "./InterestSection";
import styles from "../../styles/pages/about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.aboutAurora}>
      <main className={styles.dashboardGrid}>

        <section className={`${styles.widget} ${styles.widgetIntro}`}>
          <Introduction />
        </section>

        <aside className={`${styles.widget} ${styles.widgetSkills}`}>
          <SkillsSection />
        </aside>

        <section className={`${styles.widget} ${styles.widgetEducation}`}>
          <EducationSection />
        </section>

        <section className={`${styles.widget} ${styles.widgetExperience}`}>
          <ExperienceSection />
        </section>

        <section className={`${styles.widget} ${styles.widgetInterests}`}>
          <InterestsSection />
        </section>

      </main>
    </div>
  );
}
