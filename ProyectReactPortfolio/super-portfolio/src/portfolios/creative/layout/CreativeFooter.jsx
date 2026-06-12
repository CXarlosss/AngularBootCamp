import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function CreativeFooter() {
  return (
    <footer className="creative-footer">

      <div className="creative-footer-top">
        <h2>LET'S BUILD SOMETHING BRUTAL.</h2>
      </div>

      <div className="creative-footer-bottom">

        <div className="creative-footer-left">
          <p>© {new Date().getFullYear()} Carlos Rodríguez</p>
        </div>

        <div className="creative-footer-right">

          <motion.a
            href="#"
            whileHover={{ x: -5, y: -5 }}
          >
            <FaGithub />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ x: -5, y: -5 }}
          >
            <FaLinkedin />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ x: -5, y: -5 }}
          >
            <FaEnvelope />
          </motion.a>

        </div>

      </div>

    </footer>
  );
}

export default CreativeFooter;

