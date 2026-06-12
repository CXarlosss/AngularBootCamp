// @ts-nocheck
import { motion } from "framer-motion";

function CreativeCard({ title, description, tech, onClick }) {
  return (
    <motion.div
      className="creative-card"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
      viewport={{ once: true }}
      whileHover={{ x: -10, y: -10 }}
      onClick={onClick}
    >
      <div className="creative-card-inner">
        <h3>{title}</h3>
        <p>{description}</p>

        {tech && (
          <div className="creative-card-tech">
            {tech.map((/** @type {string | number | boolean | import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | import("react").ReactPortal | null | undefined} */ item, /** @type {import("react").Key | null | undefined} */ index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        )}

        <div className="creative-card-button">
          VIEW PROJECT →
        </div>
      </div>
    </motion.div>
  );
}

export default CreativeCard;
