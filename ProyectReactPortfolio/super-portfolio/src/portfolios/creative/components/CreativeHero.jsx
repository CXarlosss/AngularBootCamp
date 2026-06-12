import { motion } from "framer-motion";

function CreativeHero() {
  return (
    <section className="creative-hero">

      {/* TITULO LAYER 1 (stroke) */}
      <motion.h1
        className="creative-hero-outline"
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 90 }}
      >
        CARLOS
      </motion.h1>

      {/* TITULO LAYER 2 (fill) */}
      <motion.h1
        className="creative-hero-fill"
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
      >
        CARLOS
      </motion.h1>

      {/* SUBTITLE BLOCK */}
      <motion.div
        className="creative-hero-block"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
      >
        <p>
          Frontend Architect × Visual Systems × React Engineer
        </p>
      </motion.div>

    </section>
  );
}

export default CreativeHero;
