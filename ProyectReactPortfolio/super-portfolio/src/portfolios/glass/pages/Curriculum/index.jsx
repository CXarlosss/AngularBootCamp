// @ts-nocheck
import React from 'react';
import PersonalInfo from './PersonalInfo';
import SummaryObjective from './SumaryObjective';
import ExperienceList from './ExperienceList';
import EducationList from './EducationList';
import SkillsList from './SkillList';
import LanguagesList from './LanguagesList';
import styles from '../../styles/pages/CurriculumPage.module.css';

function CurriculumPage() {
  return (
    <div className={styles.curriculumWrapper}>
      <div className={styles.curriculumPage}>

        {/* LEFT COLUMN */}
        <aside className={styles.leftColumn}>
          <section className={styles.cvBlock}>
            <PersonalInfo />
          </section>

          <section className={styles.cvBlock}>
            <SkillsList />
          </section>

          <section className={styles.cvBlock}>
            <LanguagesList />
          </section>
        </aside>

        {/* RIGHT COLUMN */}
        <main className={styles.rightColumn}>
          <section className={styles.cvBlock}>
            <SummaryObjective />
          </section>

          <section className={styles.cvBlock}>
            <EducationList />
          </section>

          <section className={styles.cvBlock}>
            <ExperienceList />
          </section>
        </main>

      </div>
    </div>
  );
}

export default CurriculumPage;
