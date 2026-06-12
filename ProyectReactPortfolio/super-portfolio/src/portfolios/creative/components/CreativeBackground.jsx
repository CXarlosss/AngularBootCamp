import { motion } from "framer-motion";

function CreativeBackground() {
  return (
    <div className="creative-background">
      
      {/* GRID */}
      <div className="creative-grid" />

      {/* BLOQUE PRIMARIO */}
      <motion.div
        className="creative-shape creative-shape-primary"
        animate={{ y: [0, -30, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* BLOQUE SECUNDARIO */}
      <motion.div
        className="creative-shape creative-shape-secondary"
        animate={{ y: [0, 40, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* BLOQUE ACCENT ROTANDO */}
      <motion.div
        className="creative-shape creative-shape-accent"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

    </div>
  );
}

export default CreativeBackground;
