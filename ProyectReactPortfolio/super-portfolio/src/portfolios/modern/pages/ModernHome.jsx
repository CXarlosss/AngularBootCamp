// @ts-nocheck
import { Link } from "react-router-dom";
import ModernSection from "../global/ModernSection";
import ModernContainer from "../components/ModernContainer";
import ModernButton from "../components/ModernButton";
import ModernStat from "../components/ModernStat";
import ModernCard from "../components/ModernCard";
import styles from "./modern.home.module.css";

export default function ModernHome() {
  return (
    <main>

      {/* HERO */}
      <ModernSection size="large">
        <ModernContainer size="wide">
          <div className={styles["modern-hero"]}>
            
            <div className={styles["modern-hero-left"]}>
              <h1 className={styles["modern-hero-title"]}>
                Carlos De Petronila
                <br />
                Full Stack Developer
              </h1>

              <p className={styles["modern-hero-subtitle"]}>
                Especializado en React, Next.js y Node.js.
                Desarrollo aplicaciones modernas con arquitectura sólida,
                código limpio y experiencia de usuario cuidada al detalle.
              </p>

              <div className={styles["modern-hero-cta"]}>
                <Link to="/portfolio/modern/portfolio">
                  <ModernButton size="lg">
                    Ver proyectos →
                  </ModernButton>
                </Link>

                <Link to="/portfolio/modern/curriculum">
                  <ModernButton variant="secondary">
                    Ver CV
                  </ModernButton>
                </Link>
              </div>
            </div>

            <div className={styles["modern-hero-right"]}>
              <div className={styles["modern-hero-box"]}>
                React • Next.js • Node.js  
                <br />
                Arquitectura modular  
                <br />
                Clean code  
                <br />
                42 Madrid • Neoland
              </div>
            </div>

          </div>
        </ModernContainer>
      </ModernSection>

      {/* STATS REALES */}
      <ModernSection>
        <ModernContainer size="default">
          <div className={styles["modern-stats-grid"]}>
            <ModernStat
              value="3+"
              label="Formaciones intensivas"
              variant="accent"
            />

            <ModernStat
              value="5+"
              label="Proyectos reales"
            />

            <ModernStat
              value="∞"
              label="Iteraciones y mejoras"
            />
          </div>
        </ModernContainer>
      </ModernSection>

      {/* PROYECTOS DESTACADOS */}
      <ModernSection background="alt">
        <ModernContainer size="wide">
          <h2 className={styles["modern-home-section-title"]}>
            Proyectos destacados
          </h2>

          <div className={styles["modern-project-grid"]}>
            
            <ModernCard hover padding="lg">
              <h3>LocalMarket</h3>
              <p>
                Aplicación full stack ganadora del Bootcamp Neoland.
                Gestión de productos y arquitectura escalable.
              </p>
            </ModernCard>

            <ModernCard hover padding="lg">
              <h3>Portfolio Modular</h3>
              <p>
                Sistema multi-tema con arquitectura reutilizable y diseño
                desacoplado.
              </p>
            </ModernCard>

            <ModernCard hover padding="lg">
              <h3>API Backend</h3>
              <p>
                Desarrollo de APIs REST con Express y MongoDB,
                orientado a escalabilidad y buenas prácticas.
              </p>
            </ModernCard>

          </div>
        </ModernContainer>
      </ModernSection>

      {/* CTA FINAL */}
      <ModernSection size="large">
        <ModernContainer size="narrow">
          <div className={styles["modern-final-cta"]}>
            <h2>¿Construimos algo juntos?</h2>

            <Link to="/portfolio/modern/contact">
              <ModernButton size="lg">
                Contactar →
              </ModernButton>
            </Link>
          </div>
        </ModernContainer>
      </ModernSection>

    </main>
  );
}
