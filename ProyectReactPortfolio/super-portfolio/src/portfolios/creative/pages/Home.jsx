import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <section className="creative-home">

      {/* HERO */}
      <div className="creative-home-hero">

        <motion.h1
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          BUILD.
        </motion.h1>

        <motion.h1
          className="creative-hero-accent"
          initial={{ y: 150 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
        >
          BREAK.
        </motion.h1>

        <motion.h1
          initial={{ y: 180 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 140, delay: 0.2 }}
        >
          REBUILD.
        </motion.h1>

      </div>

      {/* MANIFESTO */}
      <motion.div
        className="creative-home-manifesto"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, delay: 0.3 }}
      >
        <p>
          Desarrollo productos digitales con enfoque en arquitectura,
          rendimiento y sistemas visuales escalables.
        </p>
      </motion.div>

      {/* PREVIEW PROJECTS */}
      <div className="creative-home-preview">

        <div className="creative-preview-block">
          <span>9</span>
          <p>Proyectos construidos</p>
        </div>

        <div className="creative-preview-block">
          <span>Full Stack</span>
          <p>React · Node · MongoDB</p>
        </div>

        <div className="creative-preview-block">
          <span>∞</span>
          <p>Iteración y mejora continua</p>
        </div>

      </div>

      {/* CTA */}
      {/* CTA Mejorada */}
<motion.div
  className="creative-cta-block"
  whileHover={{ x: -8, y: -8 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
>
  <Link to="portfolio">VER PROYECTOS →</Link>
</motion.div>


    </section>
  );
}

export default Home;
