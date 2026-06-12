// @ts-nocheck
import React from 'react';
import styles from '../../styles/components/home/heroSection.module.css';
import Button from '../../common/Button';
import profileImage from '../../../../assets/images/2 (1).jpg'; // Asegúrate de tener esta imagen en tu carpeta de assets
import { motion } from 'framer-motion';

function HeroSection() {
  return (
    <motion.section
      className={styles.hero}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={styles.heroContent}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Carlos de Petronila Rodríguez
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Desarrollador Web
        </motion.p>

        <motion.div
          className={styles.imageContainer}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <img
            src={profileImage}
            alt="Carlos de Petronila Rodríguez"
            className={styles.heroImage}
          />
        </motion.div>

        <motion.p
          className={styles.heroDescription}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Soy un desarrollador web apasionado por crear soluciones innovadoras y
          eficientes. Con experiencia en Front-end y Back-end, me encanta transformar
          ideas en experiencias web interactivas. Mi motivación, ganas de aprender y
          compromiso me impulsan a buscar constantemente nuevos desafíos.
        </motion.p>

        <motion.div
          className={styles.heroButtons}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button link="/portfolio">Ver Portfolio</Button>
          <Button link="/contact" variant="secondary">Contáctame</Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
