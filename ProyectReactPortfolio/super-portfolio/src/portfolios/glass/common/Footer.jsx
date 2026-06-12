// @ts-nocheck
import React from "react";
import styles from "./footer.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Marca / copy */}
        <div className={styles.brand}>
          <p className={styles.owner}>
            © {year} <span>Carlos de Petronila Rodríguez</span>
          </p>
          <p className={styles.tagline}>
            Desarrollador Web Full Stack — React · Node.js · MongoDB
          </p>
        </div>

        {/* Navegación secundaria */}
        <nav className={styles.footerNav} aria-label="Enlaces del sitio">
          <a href="/#projects">Proyectos</a>
          <a href="/about">Sobre mí</a>
          <a href="/#contact">Contacto</a>
          {/* <a href="/cv.pdf" download>Descargar CV</a> */}
        </nav>

        {/* Redes */}
        <div className={styles.social}>
          <a
            href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Carlos"
            className={styles.socialLink}
            title="LinkedIn"
          >
            <FaLinkedin aria-hidden="true" />
          </a>
          <a
            href="https://github.com/CXarlosss"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub de Carlos"
            className={styles.socialLink}
            title="GitHub"
          >
            <FaGithub aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <small className={styles.legal}>
          Hecho con ♥︎ y buenas prácticas — Accesible, performante y escalable.
        </small>
        <a href="#top" className={styles.backToTop} aria-label="Volver arriba">
          ↑ Arriba
        </a>
      </div>
    </footer>
  );
}
