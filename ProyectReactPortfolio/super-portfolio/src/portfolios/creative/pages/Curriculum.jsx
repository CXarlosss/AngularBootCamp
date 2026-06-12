import { motion } from "framer-motion";
import "./Curriculum.css";
const EXPERIENCES = [
  {
    title: "Programador en formación — Piscine 42",
    place: "Fundación Telefónica",
    date: "Abr 2024 – Jul 2024",
    description:
      "Entorno intensivo peer-to-peer basado en proyectos. Desarrollo en C, estructuras de datos y resolución avanzada de problemas.",
  },
  {
    title: "Informático — Soporte Técnico",
    place: "Plenum-Ingenieros",
    date: "2023",
    description:
      "Soporte hardware/software, despliegue de equipos y documentación de incidencias. Enfoque en continuidad operativa.",
  },
  {
    title: "Instalador de Paneles Solares",
    place: "SIPAMA",
    date: "2022",
    description:
      "Montaje de sistemas solares y resolución de incidencias in situ. Cumplimiento de normativa técnica.",
  },
  {
    title: "Operario de Logística",
    place: "Inditex",
    date: "2024",
    description:
      "Gestión de pedidos en alto volumen, cumplimiento de SLAs y optimización de procesos.",
  },
];

function Curriculum() {
  return (
    <section className="creative-cv">

      <motion.div
        className="creative-cv-header"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1>CURRICULUM</h1>
        <p>
          Experiencia profesional y formación construyendo mentalidad técnica,
          disciplina y arquitectura escalable.
        </p>
      </motion.div>

      <div className="creative-cv-timeline">

        {EXPERIENCES.map((exp, index) => (
          <motion.div
            key={index}
            className={`creative-cv-item ${index % 2 === 0 ? "left" : "right"}`}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            viewport={{ once: true }}
          >
            <div className="creative-cv-content">
              <span className="creative-cv-date">{exp.date}</span>
              <h3>{exp.title}</h3>
              <h4>{exp.place}</h4>
              <p>{exp.description}</p>
            </div>
          </motion.div>
        ))}

      </div>

    </section>
  );
}

export default Curriculum;
