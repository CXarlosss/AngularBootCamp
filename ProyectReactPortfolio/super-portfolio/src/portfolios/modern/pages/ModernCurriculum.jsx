// @ts-nocheck
import ModernSection from "../global/ModernSection";
import ModernContainer from "../components/ModernContainer";
import ModernCard from "../components/ModernCard";
import ModernBadge from "../components/ModernBadge";
import styles from "./modern.curriculum.module.css";

export default function ModernCurriculum() {
  return (
    <main>

      {/* HERO */}
      <ModernSection size="large">
        <ModernContainer size="narrow">
          <h1 className={styles["modern-cv-title"]}>
            Carlos De Petronila Rodríguez
          </h1>

          <p className={styles["modern-cv-subtitle"]}>
            Desarrollador Web Full Stack especializado en React, Next.js y Node.js.
            Construyo aplicaciones modernas con foco en arquitectura,
            rendimiento y experiencia de usuario.
          </p>
        </ModernContainer>
      </ModernSection>

      {/* PERFIL PROFESIONAL */}
      <ModernSection background="alt">
        <ModernContainer size="default">
          <ModernCard padding="lg">
            <h2 className={styles["modern-cv-section-title"]}>
              Perfil Profesional
            </h2>

            <p>
              Desarrollador web junior con formación intensiva en desarrollo
              frontend y full stack. Experiencia práctica en proyectos reales
              aplicando buenas prácticas de arquitectura, rendimiento,
              accesibilidad y diseño modular.
            </p>

            <p>
              Formado en entornos exigentes como Neoland y 42 Madrid, con fuerte
              orientación a la resolución de problemas, aprendizaje continuo y
              trabajo colaborativo.
            </p>
          </ModernCard>
        </ModernContainer>
      </ModernSection>

      {/* PROYECTOS DESTACADOS */}
      <ModernSection>
        <ModernContainer size="default">
          <h2 className={styles["modern-cv-section-title"]}>
            Proyectos Destacados
          </h2>

          <div className={styles["modern-cv-timeline"]}>

            <ModernCard padding="lg" hover>
              <div className={styles["modern-cv-item-header"]}>
                <h3>LocalMarket (Proyecto ganador Bootcamp Neoland)</h3>
                <span>2025</span>
              </div>

              <p>
                Aplicación full stack para conectar comercios locales con clientes.
                Gestión de productos e inventario con arquitectura escalable.
              </p>

              <div className={styles["modern-cv-stack"]}>
                <ModernBadge variant="accent">React</ModernBadge>
                <ModernBadge>Next.js</ModernBadge>
                <ModernBadge>Node.js</ModernBadge>
                <ModernBadge>Express</ModernBadge>
                <ModernBadge>MongoDB</ModernBadge>
              </div>
            </ModernCard>

            <ModernCard padding="lg" hover>
              <div className={styles["modern-cv-item-header"]}>
                <h3>Portfolio Web Profesional</h3>
                <span>2025</span>
              </div>

              <p>
                Desarrollo frontend con React y Redux enfocado en SEO,
                diseño modular y experiencia de usuario.
              </p>

              <div className={styles["modern-cv-stack"]}>
                <ModernBadge variant="accent">React</ModernBadge>
                <ModernBadge>Redux</ModernBadge>
                <ModernBadge>REST API</ModernBadge>
              </div>
            </ModernCard>

          </div>
        </ModernContainer>
      </ModernSection>

      {/* FORMACIÓN */}
      <ModernSection background="alt">
        <ModernContainer size="default">
          <h2 className={styles["modern-cv-section-title"]}>
            Formación
          </h2>

          <div className={styles["modern-cv-timeline"]}>

            <ModernCard padding="lg">
              <div className={styles["modern-cv-item-header"]}>
                <h3>Full Stack Web Development — Neoland</h3>
                <span>2025</span>
              </div>
              <p>Bootcamp intensivo orientado a desarrollo full stack profesional.</p>
            </ModernCard>

            <ModernCard padding="lg">
              <div className={styles["modern-cv-item-header"]}>
                <h3>Programa 42 Madrid — Fundación Telefónica</h3>
                <span>2024</span>
              </div>
              <p>
                Desarrollo en C, algoritmos y estructuras de datos.
              </p>
            </ModernCard>

            <ModernCard padding="lg">
              <div className={styles["modern-cv-item-header"]}>
                <h3>Front-End Web Development — IBM SkillsBuild</h3>
                <span>2024</span>
              </div>
              <p>Fundamentos de desarrollo frontend y arquitectura web.</p>
            </ModernCard>

          </div>
        </ModernContainer>
      </ModernSection>

      {/* HABILIDADES */}
      <ModernSection>
        <ModernContainer size="default">
          <h2 className={styles["modern-cv-section-title"]}>
            Stack Tecnológico
          </h2>

          <div className={styles["modern-cv-stack"]}>
            <ModernBadge variant="accent">React</ModernBadge>
            <ModernBadge>Next.js</ModernBadge>
            <ModernBadge>Redux</ModernBadge>
            <ModernBadge>Node.js</ModernBadge>
            <ModernBadge>Express</ModernBadge>
            <ModernBadge>MongoDB</ModernBadge>
            <ModernBadge>MySQL</ModernBadge>
            <ModernBadge>Git</ModernBadge>
            <ModernBadge>Vercel</ModernBadge>
            <ModernBadge>Netlify</ModernBadge>
          </div>
        </ModernContainer>
      </ModernSection>

      {/* IDIOMAS */}
      <ModernSection background="alt">
        <ModernContainer size="default">
          <h2 className={styles["modern-cv-section-title"]}>
            Idiomas
          </h2>

          <div className={styles["modern-cv-stack"]}>
            <ModernBadge>Español — Nativo</ModernBadge>
            <ModernBadge>Inglés — B2</ModernBadge>
          </div>
        </ModernContainer>
      </ModernSection>

    </main>
  );
}
