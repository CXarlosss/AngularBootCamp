// @ts-nocheck
import ModernSection from "../global/ModernSection";
import ModernContainer from "../components/ModernContainer";
import ModernStat from "../components/ModernStat";
import ModernCard from "../components/ModernCard";
import ModernBadge from "../components/ModernBadge";
import styles from "./modern.about.module.css";

export default function ModernAbout() {
  return (
    <main>

      {/* HERO */}
      <ModernSection size="large">
        <ModernContainer size="narrow">
          <h1 className={styles["modern-about-title"]}>
            Desarrollo productos digitales escalables,
            combinando arquitectura sólida y experiencia de usuario.
          </h1>

          <p className={styles["modern-about-subtext"]}>
            Desarrollador Web Full Stack con formación intensiva en Neoland y 42 Madrid.
            Especializado en React, Next.js y Node.js, con enfoque en arquitectura modular,
            rendimiento y mantenibilidad.
          </p>
        </ModernContainer>
      </ModernSection>

      {/* FILOSOFÍA */}
      <ModernSection background="alt">
        <ModernContainer size="default">
          <div className={styles["modern-about-grid"]}>

            <ModernCard padding="lg" hover>
              <h3>Mi enfoque</h3>
              <p>
                Construyo aplicaciones modernas priorizando
                estructura, claridad y escalabilidad.
                Trabajo con separación de responsabilidades,
                diseño modular y componentes reutilizables.
              </p>
            </ModernCard>

            <ModernCard padding="lg" hover>
              <h3>Arquitectura & Stack</h3>
              <p>
                Experiencia en React, Next.js, Redux,
                Node.js y MongoDB. Desarrollo APIs REST,
                estructuras limpias y soluciones preparadas
                para crecer.
              </p>
            </ModernCard>

          </div>
        </ModernContainer>
      </ModernSection>

      {/* STATS */}
      <ModernSection>
        <ModernContainer size="default">
          <div className={styles["modern-stats-grid"]}>
            <ModernStat value="5+" label="Proyectos reales desarrollados" variant="accent" />
            <ModernStat value="42" label="Formación técnica intensiva" />
            <ModernStat value="100%" label="Orientación a mejora continua" />
          </div>
        </ModernContainer>
      </ModernSection>

      {/* STACK */}
      <ModernSection background="alt">
        <ModernContainer size="default">
          <h2 className={styles["modern-about-subtitle"]}>
            Stack tecnológico
          </h2>

          <div className={styles["modern-badges-grid"]}>
            <ModernBadge variant="accent">React</ModernBadge>
            <ModernBadge variant="accent">Next.js</ModernBadge>
            <ModernBadge>Redux</ModernBadge>
            <ModernBadge>TypeScript</ModernBadge>
            <ModernBadge>Node.js</ModernBadge>
            <ModernBadge>Express</ModernBadge>
            <ModernBadge>MongoDB</ModernBadge>
            <ModernBadge>SQL</ModernBadge>
            <ModernBadge>Tailwind</ModernBadge>
          </div>
        </ModernContainer>
      </ModernSection>

    </main>
  );
}
