import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    BsLayerForward, BsBoxSeam, BsCpu, BsHddNetwork,
    BsGrid3X3Gap, BsCodeSlash, BsCommand, BsVectorPen, BsSpeedometer
} from "react-icons/bs";
import MainLayout from "../layouts/MainLayout";
import styles from "./StudioPage.module.css";

const StudioPage = () => {
    const navigate = useNavigate();

    // Animation variants
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const drawLine = {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true },
        transition: { duration: 1.5, ease: "easeInOut" }
    };

    return (
        <MainLayout>
            <div className={styles.studioWrapper}>
                <div className={styles.contentContainer}>

                    {/* 1. HERO SECTION */}
                    <section className={styles.heroSection}>
                        <Container>
                            <motion.span
                                className={styles.heroTag}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                [ ARCHITECTURAL CORE ]
                            </motion.span>
                            <motion.h1
                                className={styles.heroTitle}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                STUDIO_LOGIC
                            </motion.h1>
                            <motion.p
                                className={styles.heroSubtitle}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Architecting the multi-aesthetic universe through
                                system-oriented design and precision engineering.
                            </motion.p>

                            <div className={styles.blueprintContainer}>
                                <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none">
                                    {/* Blueprint Grid/Lines */}
                                    <motion.path
                                        d="M 100 100 L 700 100 L 700 300 L 100 300 Z"
                                        stroke="var(--accentSecondary)"
                                        strokeWidth="0.5"
                                        variants={drawLine}
                                        initial="initial"
                                        whileInView="whileInView"
                                        viewport={{ once: true }}
                                    />
                                    <motion.path
                                        d="M 100 200 L 700 200 M 400 100 L 400 300"
                                        stroke="var(--accentSecondary)"
                                        strokeWidth="0.5"
                                        variants={drawLine}
                                        initial="initial"
                                        whileInView="whileInView"
                                        viewport={{ once: true }}
                                    />
                                    <motion.circle
                                        cx="400" cy="200" r="150"
                                        stroke="var(--accentSecondary)"
                                        strokeWidth="0.5"
                                        variants={drawLine}
                                        initial="initial"
                                        whileInView="whileInView"
                                        viewport={{ once: true }}
                                    />
                                    <motion.circle
                                        cx="400" cy="200" r="10"
                                        fill="var(--accentSecondary)"
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                    />
                                </svg>
                                <div className={styles.blueprintOverlay}></div>
                            </div>
                        </Container>
                    </section>

                    {/* 2. FILOSOFÍA */}
                    <section className={styles.section}>
                        <Container>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>01 // CONCEPTUAL_PILLARS</span>
                                <h2 className={styles.sectionTitle}>Philosophy</h2>
                            </div>

                            <div className={styles.philosophyGrid}>
                                <motion.div className={styles.philosophyCard} {...fadeIn}>
                                    <BsGrid3X3Gap size={30} className="mb-4 text-accent" />
                                    <h3>System Thinking</h3>
                                    <p>We don't design pages; we design systems. Every element is part of a larger, interconnected logic that maintains consistency across dimensions.</p>
                                </motion.div>

                                <motion.div className={styles.philosophyCard} {...fadeIn} transition={{ delay: 0.2 }}>
                                    <BsBoxSeam size={30} className="mb-4 text-accent" />
                                    <h3>Modular Design</h3>
                                    <p>Our architecture is built on independent, reusable modules. This allows for rapid iteration and the seamless synthesis of new aesthetic dimensions.</p>
                                </motion.div>

                                <motion.div className={styles.philosophyCard} {...fadeIn} transition={{ delay: 0.3 }}>
                                    <BsSpeedometer size={30} className="mb-4 text-accent" />
                                    <h3>Performance First</h3>
                                    <p>High-end visuals require high-end optimization. We treat performance as a core design feature, not an afterthought.</p>
                                </motion.div>

                                <motion.div className={styles.philosophyCard} {...fadeIn} transition={{ delay: 0.4 }}>
                                    <BsCommand size={30} className="mb-4 text-accent" />
                                    <h3>Clean Architecture</h3>
                                    <p>Decoupling concerns and ensuring type-safe structures. Our mindset is rooted in software engineering principles applied to creative interfaces.</p>
                                </motion.div>
                            </div>
                        </Container>
                    </section>

                    {/* 3. METHODOLOGY PIPELINE */}
                    <section className={styles.section}>
                        <Container>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>02 // EXECUTION_FLOW</span>
                                <h2 className={styles.sectionTitle}>Methodology Pipeline</h2>
                            </div>

                            <div className={styles.pipelineContainer}>
                                {[
                                    { label: "Idea", icon: <BsCommand /> },
                                    { label: "System Design", icon: <BsGrid3X3Gap /> },
                                    { label: "Architecture", icon: <BsLayerForward /> },
                                    { label: "UI System", icon: <BsVectorPen /> },
                                    { label: "Development", icon: <BsCodeSlash /> },
                                    { label: "Optimization", icon: <BsSpeedometer /> }
                                ].map((step, index, arr) => (
                                    <motion.div
                                        key={step.label}
                                        className={styles.pipelineStep}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className={styles.stepIcon}>{step.icon}</div>
                                        <span className={styles.stepLabel}>{step.label}</span>
                                        {index < arr.length - 1 && <div className={styles.connector}></div>}
                                    </motion.div>
                                ))}
                            </div>
                        </Container>
                    </section>

                    {/* 4. STACK MENTAL MODEL */}
                    <section className={styles.section}>
                        <Container>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>03 // COGNITIVE_STACK</span>
                                <h2 className={styles.sectionTitle}>Stack Mental Model</h2>
                            </div>

                            <div className={styles.stackGrid}>
                                <div className={styles.stackItem}>
                                    <BsCodeSlash />
                                    <span className={styles.stackTitle}>Frontend</span>
                                    <p className={styles.stackDesc}>React / Next.js / GSAP</p>
                                </div>
                                <div className={styles.stackItem}>
                                    <BsHddNetwork />
                                    <span className={styles.stackTitle}>Backend</span>
                                    <p className={styles.stackDesc}>Node.js / Go / PostgreSQL</p>
                                </div>
                                <div className={styles.stackItem}>
                                    <BsCpu />
                                    <span className={styles.stackTitle}>Data</span>
                                    <p className={styles.stackDesc}>Visualization / Real-time</p>
                                </div>
                                <div className={styles.stackItem}>
                                    <BsLayerForward />
                                    <span className={styles.stackTitle}>DevOps</span>
                                    <p className={styles.stackDesc}>Docker / CI/CD / Edge</p>
                                </div>
                                <div className={styles.stackItem}>
                                    <BsVectorPen />
                                    <span className={styles.stackTitle}>UX</span>
                                    <p className={styles.stackDesc}>Immersive Logic / A11y</p>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* 5. DESIGN SYSTEMS */}
                    <section className={styles.section}>
                        <Container>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>04 // DIMENSIONAL_CORE</span>
                                <h2 className={styles.sectionTitle}>Design Systems</h2>
                            </div>

                            <div className={styles.dsContent}>
                                <div className={styles.dsVisual}>
                                    {/* Abstract representation of a core system splitting into 6 dimensions */}
                                    <svg width="100%" height="100%" viewBox="0 0 400 300">
                                        <circle cx="200" cy="150" r="40" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" />
                                        {[0, 60, 120, 180, 240, 300].map(angle => (
                                            <motion.line
                                                key={angle}
                                                x1="200" y1="150"
                                                x2={200 + Math.cos(angle * Math.PI / 180) * 100}
                                                y2={150 + Math.sin(angle * Math.PI / 180) * 80}
                                                stroke="var(--accentSecondary)"
                                                strokeWidth="1"
                                                initial={{ pathLength: 0 }}
                                                whileInView={{ pathLength: 1 }}
                                                transition={{ duration: 1 }}
                                            />
                                        ))}
                                    </svg>
                                </div>
                                <div className={styles.dsText}>
                                    <h3>One Core, Six Realities</h3>
                                    <p>
                                        Every portfolio in our universe follows a singular Design System logic.
                                        Glass, Modern, Retro, Creative, Parallax, and CSS Playground are
                                        morphological variations of a shared architectural backbone.
                                        This ensures that while the aesthetics change, the structural integrity remains absolute.
                                    </p>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* 6. FINAL CTA */}
                    <section className={styles.finalCTA}>
                        <Container>
                            <h2 className={styles.ctaTitle}>Enter the Universe</h2>
                            <motion.button
                                className={styles.btnCTA}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                            >
                                EXPLORE DIMENSIONS
                            </motion.button>
                        </Container>
                    </section>

                </div>
            </div>
        </MainLayout>
    );
};

export default StudioPage;
