import { motion } from "framer-motion";
import CreativeCard from "../components/CreativeCard";
import "./About.css";
function About() {
  return (
    <section className="creative-about">

      {/* HEADER */}
      <motion.div
        className="creative-about-header"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1>SOBRE MÍ</h1>
        <p>
          Desarrollador Full Stack enfocado en arquitectura frontend,
          sistemas visuales y productos digitales escalables.
        </p>
      </motion.div>

      {/* PRESENTACIÓN */}
      <div className="creative-about-intro">
        <CreativeCard
                  title="Carlos de Petronila Rodríguez"
                  description={`Soy desarrollador Full Stack con pasión por transformar ideas
          en soluciones digitales rápidas, accesibles y bien estructuradas.
          Trabajo con React, TypeScript, Node.js y MongoDB aplicando patrones
          de diseño y buenas prácticas.`} tech={undefined} onClick={undefined}        />
      </div>

      {/* STACK */}
      <div className="creative-about-stack">
        <h2>STACK PRINCIPAL</h2>
        <div className="creative-stack-grid">
          {[
            "React + TypeScript",
            "Node.js / Express",
            "MongoDB",
            "Next.js (SSR / SSG)",
            "Tailwind",
            "Testing básico",
            "CI/CD en progreso"
          ].map((tech, i) => (
            <motion.div
              key={i}
              className="creative-stack-item"
              whileHover={{ x: -6, y: -6 }}
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>

      {/* EXPERIENCIA */}
      <div className="creative-about-experience">
        <h2>EXPERIENCIA</h2>

        <CreativeCard
                  title="Piscine 42 Madrid"
                  description="Entorno intensivo peer-to-peer basado en proyectos. Desarrollo en C y estructuras de datos. Enfoque en resolución de problemas." tech={undefined} onClick={undefined}        />

        <CreativeCard
                  title="Soporte Técnico"
                  description="Soporte hardware/software, despliegue de equipos y documentación de incidencias." tech={undefined} onClick={undefined}        />

        <CreativeCard
                  title="Logística & Energía Solar"
                  description="Optimización de procesos, cumplimiento de SLAs y trabajo bajo presión." tech={undefined} onClick={undefined}        />
      </div>

      {/* PASSIONS */}
      <div className="creative-about-passions">
        <h2>FUERA DEL CÓDIGO</h2>

        <div className="creative-passions-grid">
          {[
            "Música",
            "Deporte",
            "Viajar",
            "Cine",
            "Cocina",
            "Videojuegos",
            "Lectura",
            "Senderismo"
          ].map((item, i) => (
            <motion.div
              key={i}
              className="creative-passion-item"
              whileHover={{ rotate: -2, x: -5, y: -5 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}

export default About;
