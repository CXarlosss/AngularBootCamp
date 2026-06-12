import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { BsArrowRight, BsGithub } from "react-icons/bs";
import styles from "./HeroSection.module.css";
import profilePhoto from "../../assets/images/profile.jpg";

const HeroSection = () => {
    return (
        <section className={styles.heroSection}>
            <Container>
                <div className={styles.topBar}>
                    <div className={styles.statusBadge}>
                        <span className={styles.dot}></span>
                        <span>MADRID, ES | UTC+1</span>
                    </div>
                </div>

                <Row className="align-items-center">
                    <Col lg={7} className={styles.textColumn}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className={styles.name}>Carlos De Petronila Rodríguez</h1>
                            <p className={styles.role}>Full Stack Engineer | System-Oriented Developer</p>
                            <p className={styles.humanContext}>42 Madrid · Neoland · Madrid, ES</p>
                        </motion.div>

                        <motion.h2
                            className={styles.tagline}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Building scalable full stack systems <br />
                            <span className={styles.highlight}>with modular architecture and performance-first engineering.</span>
                        </motion.h2>

                        <motion.div
                            className={styles.availability}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p>Currently open to Full Stack opportunities in product-driven teams.</p>
                        </motion.div>

                        <motion.div
                            className={styles.actions}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <a href="/projects" className={styles.btnPrimary}>
                                View Case Studies <BsArrowRight />
                            </a>
                            <a href="https://github.com/CXarlosss" target="_blank" rel="noreferrer" className={styles.btnSecondary}>
                                <BsGithub /> GitHub
                            </a>
                        </motion.div>
                    </Col>

                    <Col lg={5} className="d-none d-lg-flex justify-content-end">
                        <motion.div
                            className={styles.imageWrapper}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className={styles.profileFrame}>
                                <img
                                    src={profilePhoto}
                                    alt="Carlos De Petronila Rodríguez"
                                    className={styles.profileImg}
                                />
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default HeroSection;
