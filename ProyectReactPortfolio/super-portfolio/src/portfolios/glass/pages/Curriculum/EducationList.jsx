// @ts-nocheck
import React from "react";
import styles from "../../styles/components/curriculum/education.module.css";
import educationData from "../../../../data/Education/educationList";

function EducationList() {
  return (
    <div className={styles.education}>
      <h2 className={styles.mainTitle}>Formación Académica</h2>
      <div className={styles.educationItemsContainer}>
        {educationData.map((item, index) => (
          <div key={index} className={styles.educationItem}>
            <h3 className={styles.educationTitle}>{item.title}</h3>
            <p className={styles.educationInstitution}>{item.institution}</p>
            <p className={styles.educationDate}>{item.date}</p>
            <p className={styles.educationDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EducationList;
