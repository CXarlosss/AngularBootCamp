import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { BsCpu, BsHddNetwork, BsLayerForward, BsCodeSlash } from "react-icons/bs";
import styles from "./EngineeringSection.module.css";

const EngineeringSection = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section className={styles.engSection}>
            <Container>
                <Row className="mb-5 align-items-end">
                    <Col lg={7}>
                        <span className={styles.tag}>[ ENGINEERING_LOG ]</span>
                        <h2 className={styles.title}>Key Design Decisions</h2>
                    </Col>
                    <Col lg={5} className="text-lg-end">
                        <div className={styles.education}>
                            <strong>Engineering Metrics:</strong> 90ms API Latency · Optimized Bundles
                        </div>
                    </Col>
                </Row>

                <Row className="g-4">
                    <Col md={4}>
                        <motion.div className={styles.engCard} {...fadeIn}>
                            <BsCodeSlash className={styles.icon} />
                            <h3>Decoupled Aesthetic Layer</h3>
                            <p>Implemented a morphological UI strategy to separate business logic from the visual dimension, reducing technical debt during theme pivots.</p>
                        </motion.div>
                    </Col>
                    <Col md={4}>
                        <motion.div className={styles.engCard} {...fadeIn} transition={{ delay: 0.1 }}>
                            <BsHddNetwork className={styles.icon} />
                            <h3>Atomic Performance</h3>
                            <p>Reduced initial bundle size by 32% through strategic code-splitting and dynamic imports of dimensional microsites.</p>
                        </motion.div>
                    </Col>
                    <Col md={4}>
                        <motion.div className={styles.engCard} {...fadeIn} transition={{ delay: 0.2 }}>
                            <BsLayerForward className={styles.icon} />
                            <h3>Scalable Data Flow</h3>
                            <p>Architected a modular state management system using React Context and custom hooks to ensure low-latency reactivity across complex components.</p>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default EngineeringSection;
