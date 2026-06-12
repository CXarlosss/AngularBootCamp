// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import "./Portfolio.css";
import { PROJECTS } from "../data/projects.js"; // 👉 mueve tu array aquí

function Portfolio() {
  const [filter, setFilter] = useState("Todos");

  const categories = ["Todos", "React", "TypeScript", "Full Stack"];

  const filteredProjects =
    filter === "Todos"
      ? PROJECTS
      : PROJECTS.filter((project) =>
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(filter.toLowerCase())
          )
        );

  return (
    <section className="creative-portfolio">

      {/* HEADER */}
      <div className="creative-portfolio-header">
        <h1>MI PORTFOLIO</h1>
        <p>
          Una selección de proyectos construidos con enfoque en arquitectura,
          rendimiento y experiencia de usuario.
        </p>
      </div>

      {/* STATS */}
      <div className="creative-portfolio-stats">
        <Stat number="9" label="Proyectos" />
        <Stat number="15+" label="Tecnologías" />
        <Stat number="100%" label="Responsive" />
        <Stat number="∞" label="Creatividad" />
      </div>

      {/* FILTERS */}
      <div className="creative-portfolio-filters">
        {categories.map((cat) => (
          <motion.div
            key={cat}
            className={`creative-filter ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
            whileHover={{ x: -4, y: -4 }}
          >
            {cat}
          </motion.div>
        ))}
      </div>

      {/* GRID */}
      <div className="creative-portfolio-grid">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="creative-portfolio-card"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            viewport={{ once: true }}
            style={{
              transform: `rotate(${index % 2 === 0 ? "-1.5deg" : "1.5deg"})`,
            }}
          >
            <div className="creative-portfolio-card-inner">
              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <div className="creative-tech-tags">
                {project.technologies.slice(0, 3).map((tech, i) => (
                  <span key={i}>{tech}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}

function Stat({ number, label }) {
  return (
    <div className="creative-stat">
      <span>{number}</span>
      <p>{label}</p>
    </div>
  );
}

export default Portfolio;
