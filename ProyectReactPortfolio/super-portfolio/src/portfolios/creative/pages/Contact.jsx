// @ts-nocheck
import { motion } from "framer-motion";

import "./Contact.css";
function Contact() {
  return (
    <section className="creative-contact">

      {/* HEADER */}
      <motion.div
        className="creative-contact-header"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1>CONTACTO</h1>
        <p>
          Si tienes una idea, proyecto o colaboración en mente,
          hablemos.
        </p>
      </motion.div>

      {/* GRID */}
      <div className="creative-contact-grid">

        {/* FORM BLOCK */}
        <motion.form
          className="creative-contact-form"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90 }}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" />
          </div>

          <div className="form-group">
            <label>Mensaje</label>
            <textarea rows="4" />
          </div>

          <motion.button
            type="submit"
            className="creative-submit"
            whileHover={{ x: -6, y: -6 }}
          >
            ENVIAR →
          </motion.button>
        </motion.form>

        {/* INFO BLOCK */}
        <motion.div
          className="creative-contact-info"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90 }}
        >
          <h2>Hablemos</h2>
          <p>
            Estoy abierto a oportunidades freelance, colaboraciones
            y proyectos que requieran arquitectura frontend sólida.
          </p>

          <div className="creative-contact-meta">
            <div><a href="mailto:carlosdepet@gmail.com">Email</a></div>
            <div> <a href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/">LinkedIn </a></div>
            <div><a
              href="https://github.com/CXarlosss"
              target="_blank"
              rel="noopener noreferrer"
            >
              @CXarlosss
            </a></div>
          </div>
        </motion.div>

      </div>

    </section>
  );
}

export default Contact;
