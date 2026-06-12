// @ts-nocheck
import { PROJECTS } from "../../creative/data/projects";
import styles from "../styles/playground.portfolio.module.css";

const Portfolio = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Selected Projects</h1>

      <div className={styles.grid}>
        {PROJECTS.map((project) => (
          <div key={project.id} className={styles.card}>
            <img
              src={project.thumbnail}
              alt={project.title}
              className={styles.image}
            />

            <h3>{project.title}</h3>
            <p>{project.description}</p>

            <div className={styles.tech}>
              {project.technologies.map((tech, index) => (
                <span key={index}>{tech}</span>
              ))}
            </div>

            <div className={styles.links}>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              <a
                href={project.liveDemoLink}
                target="_blank"
                rel="noreferrer"
              >
                Live Demo
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
