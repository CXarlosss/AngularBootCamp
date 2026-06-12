// @ts-nocheck
import styles from "./modern.footer.module.css";
import ModernContainer from "../components/ModernContainer";

export default function ModernFooter() {
  return (
    <footer className={styles["modern-footer"]}>
      <ModernContainer size="wide">

        <div className={styles["modern-footer-top"]}>
          <h2>Construyamos algo grande.</h2>
          <p>Disponible para nuevos proyectos digitales.</p>
        </div>

        <div className={styles["modern-footer-divider"]} />

        <div className={styles["modern-footer-bottom"]}>
          <span>© {new Date().getFullYear()} Carlos</span>

          <div className={styles["modern-footer-links"]}>
            <a
              href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
              target="_blank"
              rel="noreferrer"
              className={styles["modern-footer-link"]}
            >
              LinkedIn
            </a>

            <a
              href="https://github.com/CXarlosss"
              target="_blank"
              rel="noreferrer"
              className={styles["modern-footer-link"]}
            >
              GitHub
            </a>

          </div>
        </div>

      </ModernContainer>
    </footer>
  );
}
