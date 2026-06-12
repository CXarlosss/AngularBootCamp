// @ts-nocheck

import ModernSection from "../global/ModernSection";
import ModernContainer from "../components/ModernContainer";
import ModernBadge from "../components/ModernBadge";
import ModernButton from "../components/ModernButton";
import { PROJECTS } from "../data/projects"; // <-- importa tu array real
import styles from "./modern.portfolio.module.css";

export default function ModernPortfolio() {
    console.log("PROJECTS:", PROJECTS);
  console.log("TOTAL:", PROJECTS.length);
  return (
    <main>

      {/* HERO */}
      <ModernSection size="large">
        <ModernContainer size="narrow">
          <h1 className={styles["modern-portfolio-title"]}>
            Selected Work.
          </h1>
          <p className={styles["modern-portfolio-subtitle"]}>
            Aplicaciones Full Stack, sistemas escalables y productos digitales reales.
          </p>
        </ModernContainer>
      </ModernSection>

      {/* PROJECTS */}
      <ModernSection>
        <ModernContainer size="wide">

          <div className={styles["modern-project-list"]}>

            {PROJECTS.map((project, index) => (
              <div
                key={project.id}
                className={styles["modern-project-item"]}
              >

                {/* NUMBER */}
                <div className={styles["modern-project-number"]}>
                  {(index + 1).toString().padStart(2, "0")}
                </div>

                {/* IMAGE */}
                <div className={styles["modern-project-image"]}>
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                  />
                </div>

                {/* CONTENT */}
                <div className={styles["modern-project-content"]}>
                  <h2>{project.title}</h2>

                  <p>{project.description}</p>

                  <div className={styles["modern-project-stack"]}>
                    {project.technologies.slice(0, 5).map((tech, i) => (
                      <ModernBadge key={i} variant="accent">
                        {tech}
                      </ModernBadge>
                    ))}
                  </div>

                  <div className={styles["modern-project-links"]}>
                    <a href={project.githubLink} target="_blank" rel="noreferrer">
                      <ModernButton size="sm">
                        GitHub →
                      </ModernButton>
                    </a>

                    {project.liveDemoLink && (
                      <a href={project.liveDemoLink} target="_blank" rel="noreferrer">
                        <ModernButton size="sm" variant="secondary">
                          Live →
                        </ModernButton>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}

          </div>

        </ModernContainer>
      </ModernSection>

    </main>
  );
}
