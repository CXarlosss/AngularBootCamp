// @ts-nocheck
import React from "react";
import styles from "../../styles/components/home/skillBadge.module.css";
import { FaHtml5, FaCss3Alt as FaCss3, FaJs, FaReact, FaNodeJs } from "react-icons/fa";

const skills = [
  { icon: <FaHtml5 aria-hidden="true" />, label: "HTML5" },
  { icon: <FaCss3 aria-hidden="true" />, label: "CSS3" },
  { icon: <FaJs aria-hidden="true" />, label: "JavaScript" },
  { icon: <FaReact aria-hidden="true" />, label: "React" },
  { icon: <FaNodeJs aria-hidden="true" />, label: "Node.js" },
];

function SkillsHighlight() {
  return (
    <section className={styles.skillsHighlight} aria-labelledby="skills-title">
      <header className={styles.header}>
        <span className={styles.kicker}>Stack principal</span>
        <h2 id="skills-title" className={styles.title}>Habilidades destacadas</h2>
        <p className={styles.subtitle}>
          Front-end sólido con enfoque en UX y rendimiento, y base back-end para construir
          soluciones completas.
        </p>
      </header>

      <ul className={styles.grid} > 
        {skills.map(({ icon, label }) => (
          <li key={label} className={styles.card}>
            <span className={styles.iconWrap}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </li>
        ))}
      </ul>

      <p className={styles.description}>
        Construyo interfaces claras y accesibles con React y buenas prácticas de CSS/JS.
        En back-end, trabajo con Node.js para APIs seguras y mantenibles.
      </p>
    </section>
  );
}

export default SkillsHighlight;
