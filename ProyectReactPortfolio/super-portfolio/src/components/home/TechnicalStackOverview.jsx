import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BsCodeSquare, BsTerminal, BsLightning, BsDiagram3 } from "react-icons/bs";
import styles from "./TechnicalStackOverview.module.css";

const TechnicalStackOverview = () => {
    const clusters = [
        {
            icon: <BsCodeSquare />,
            title: "Frontend Architecture",
            skills: ["React 18", "Next.js", "State Management (Redux/Context)", "CSS Modules / SCSS", "Framer Motion"]
        },
        {
            icon: <BsTerminal />,
            title: "Backend & Logic",
            skills: ["Node.js / Express", "PostgreSQL", "Redis", "REST & GraphQL", "Query Optimization"]
        },
        {
            icon: <BsDiagram3 />,
            title: "System Design",
            skills: ["Modular Monoliths", "Event-Driven Logic", "Clean Architecture", "API Design", "Database Modeling"]
        },
        {
            icon: <BsLightning />,
            title: "Engineering Process",
            skills: ["CD/CI Pipelines", "Git Workflow", "Performance Profiling", "Documentation", "Unit Testing"]
        }
    ];

    return (
        <section className={styles.stackSection}>
            <Container>
                <div className={styles.header}>
                    <h2 className={styles.title}>Technical <span className={styles.highlight}>Clusters</span></h2>
                </div>

                <Row className="g-4">
                    {clusters.map((cluster, i) => (
                        <Col md={6} lg={3} key={i}>
                            <div className={styles.clusterCard}>
                                <div className={styles.icon}>{cluster.icon}</div>
                                <h3>{cluster.title}</h3>
                                <ul className={styles.skillList}>
                                    {cluster.skills.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default TechnicalStackOverview;
