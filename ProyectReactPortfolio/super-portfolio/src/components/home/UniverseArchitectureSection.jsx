import React from "react";
import { Container, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { useDimension } from "../../context/DimensionContext";
import styles from "./UniverseArchitectureSection.module.css";

const UISkinEngine = ({ innerRef }) => {
    const { dimension, changeDimension } = useDimension();

    const skins = [
        { id: "standard", name: "Core Architecture", desc: "Clean & Industrial", icon: "⚙️", span: 6 },
        { id: "modern", name: "Minimalist Layer", desc: "Zero Noise Logic", icon: "🔳", span: 6 },
        { id: "retro", name: "Analog Buffer", desc: "System CRT Simulation", icon: "📟", span: 6 },
        { id: "glass", name: "Refractive Skin", desc: "Translucency & Frost", icon: "🌀", span: 6 },
    ];

    return (
        <section className={styles.universeSection} id="engine" ref={innerRef}>
            <Container>
                <div className={styles.sectionHeader}>
                    <Col lg={8}>
                        <span className={styles.tag}>[ POC: THEME_ENGINE ]</span>
                        <h2 className={styles.title}>Morphic UI Engine</h2>
                        <p className={styles.description}>
                            This portfolio demonstrates a <strong>Modular Theming Architecture</strong>.
                            The system core remains immutable while the visual layer adapts through CSS Design Tokens.
                            Switch skins to see the decoupling in action.
                        </p>
                    </Col>
                </div>

                <div className={styles.bentoGrid}>
                    {skins.map((skin) => (
                        <motion.div
                            key={skin.id}
                            className={`${styles.bentoItem} ${styles[skin.id]} ${dimension === skin.id ? styles.active : ""}`}
                            whileHover={{ y: -5, borderColor: "var(--accentPrimary)" }}
                            onClick={() => changeDimension(skin.id)}
                            style={{ gridColumn: `span ${skin.span}` }}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.dimIcon}>{skin.icon}</span>
                                <h3>{skin.name}</h3>
                            </div>
                            <p>{skin.desc}</p>
                            <div className={styles.cardAction}>
                                {dimension === skin.id ? "[ SYSTEM_ACTIVE ]" : `INJECT_${skin.id.toUpperCase()}_TOKEN`}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default UISkinEngine;
