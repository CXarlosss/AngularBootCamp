import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./MindsetSection.module.css";

const MindsetSection = () => {
    return (
        <section className={styles.mindsetSection}>
            <Container>
                <Row className="align-items-center">
                    <Col lg={5}>
                        <h2 className={styles.title}>Systematic Approach to Web Performance.</h2>
                    </Col>
                    <Col lg={7}>
                        <p className={styles.description}>
                            I build architectures that prioritize <strong>stability and scalability</strong>.
                            By decoupling the visual layer from the core business logic, I create systems that are
                            maintainable, testable, and capable of evolving without redesigning the foundation.
                        </p>
                        <div className={styles.attributes}>
                            <div className={styles.attr}>
                                <strong>Stability:</strong> Decoupled core logic.
                            </div>
                            <div className={styles.attr}>
                                <strong>Scalability:</strong> Horizontal system growth.
                            </div>
                            <div className={styles.attr}>
                                <strong>Efficiency:</strong> Performance as a primary feature.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default MindsetSection;
