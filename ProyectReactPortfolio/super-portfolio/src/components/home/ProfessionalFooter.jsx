import React from "react";
import { Container } from "react-bootstrap";
import { BsGithub, BsLinkedin, BsEnvelope } from "react-icons/bs";
import styles from "./ProfessionalFooter.module.css";

const ProfessionalFooter = () => {
    return (
        <footer className={styles.footer}>
            <Container>
                <div className={styles.content}>
                    <div className={styles.brand}>
                        <span className={styles.logo}>Carlos De Petronila Rodríguez</span>
                        <p>Full Stack Engineer | System-Oriented Developer</p>
                    </div>

                    <div className={styles.links}>
                        <div className={styles.linkGroup}>
                            <a href="https://github.com/CXarlosss" target="_blank" rel="noreferrer"><BsGithub /> GitHub</a>
                            <a href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/" target="_blank" rel="noreferrer"><BsLinkedin /> LinkedIn</a>
                            <a href="mailto:carlosdepet@gmail.com"><BsEnvelope /> Email</a>
                        </div>
                        <div className={styles.linkGroup}>
                            <a href="/cv">Resume/CV</a>
                            <a href="/projects">Case Studies</a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2026 Madrid, ES. Built for professional integrity and performance.</p>
                </div>
            </Container>
        </footer>
    );
};

export default ProfessionalFooter;
