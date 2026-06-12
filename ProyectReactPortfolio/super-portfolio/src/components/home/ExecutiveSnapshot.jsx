import React from "react";
import { Container } from "react-bootstrap";
import { BsCheck2Circle, BsCpu, BsLayers, BsLightningCharge } from "react-icons/bs";
import styles from "./ExecutiveSnapshot.module.css";

const ExecutiveSnapshot = () => {
    const expertise = [
        {
            icon: <BsCheck2Circle />,
            title: "React & Node Ecosystem",
            desc: "Full-cycle delivery from architecture to deployment."
        },
        {
            icon: <BsLayers />,
            title: "Modular Architecture",
            desc: "Focus on decoupled systems and clean code standards."
        },
        {
            icon: <BsLightningCharge />,
            title: "Performance First",
            desc: "Frontend rendering and backend throughput optimization."
        },
        {
            icon: <BsCpu />,
            title: "Systems Mindset",
            desc: "Engineering-driven approach to long-term maintainability."
        }
    ];

    return (
        <section className={styles.snapshotSection}>
            <Container>
                <div className={styles.grid}>
                    {expertise.map((item, i) => (
                        <div key={i} className={styles.snapshotCard}>
                            <div className={styles.icon}>{item.icon}</div>
                            <div className={styles.content}>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default ExecutiveSnapshot;
