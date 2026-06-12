import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import DimensionToggle from "../components/ui/DimensionToggle";
import { BsFileEarmarkPdf, BsLightningCharge, BsLayers, BsCpu, BsGear } from "react-icons/bs";
import styles from "./CVPage.module.css";

const CVPage = () => {
    return (
        <MainLayout>
            <div className={styles.pageWrapper}>
                <Container>
                    <header className={styles.pageHeader}>
                        <div className={styles.headerMeta}>
                            <span className={styles.serial}>ENGINEERING_PROFILE_2026</span>
                            <DimensionToggle />
                        </div>
                        <h1 className={styles.name}>Carlos De Petronila Rodríguez</h1>
                        <p className={styles.role}>Full Stack Engineer | System-Oriented Developer</p>
                        <div className={styles.locationInfo}>
                            <span>Madrid, ES</span>
                            <span className={styles.divider}>|</span>
                            <a href="mailto:carlosdepet@gmail.com">carlosdepet@gmail.com</a>
                            <span className={styles.divider}>|</span>
                            <a href="https://linkedin.com/in/carlos-de-petronila-rodriguez/" target="_blank" rel="noreferrer">LinkedIn</a>
                            <span className={styles.divider}>|</span>
                            <a href="https://github.com/CXarlosss" target="_blank" rel="noreferrer">GitHub</a>
                        </div>

                        <div className={styles.summaryContainer}>
                            <p className={styles.summaryText}>
                                Full Stack Engineer with hands-on experience building end-to-end web applications using React, Next.js and Node.js.
                                Strong focus on modular system design, clean architecture principles and measurable performance optimization.
                            </p>
                            <p className={styles.summaryText}>
                                Experience developing scalable backend services and UI systems with separation of concerns and token-based theming strategies.
                                Background in intensive technical environments such as 42 Madrid and Neoland, with a product-oriented mindset and strong problem-solving skills.
                            </p>
                            <button className={styles.downloadBtn} onClick={() => window.print()}><BsFileEarmarkPdf /> Download Technical PDF</button>
                        </div>
                    </header>

                    {/* TECHNICAL CORE - CLUSTERED */}
                    <section className={styles.editorialSection}>
                        <h2 className={styles.sectionLabel}>Technical Core</h2>
                        <div className={styles.clusterGrid}>
                            <div className={styles.cluster}>
                                <div className={styles.clusterHead}><BsLayers /> <h3>Frontend Architecture</h3></div>
                                <p>React · Next.js · Redux · Context API</p>
                                <p className={styles.subCluster}>SCSS · CSS Modules · Design Tokens · Framer Motion</p>
                            </div>
                            <div className={styles.cluster}>
                                <div className={styles.clusterHead}><BsLightningCharge /> <h3>Backend & Data</h3></div>
                                <p>Node.js · Express · REST APIs</p>
                                <p className={styles.subCluster}>PostgreSQL · MongoDB · Redis · Query Optimization</p>
                            </div>
                            <div className={styles.cluster}>
                                <div className={styles.clusterHead}><BsCpu /> <h3>System Design</h3></div>
                                <p>Modular Monoliths · Event-Driven Patterns</p>
                                <p className={styles.subCluster}>Clean Architecture · API Design · Database Modeling</p>
                            </div>
                            <div className={styles.cluster}>
                                <div className={styles.clusterHead}><BsGear /> <h3>Engineering Process</h3></div>
                                <p>Git Workflow · CI/CD Pipelines</p>
                                <p className={styles.subCluster}>Performance Profiling · Documentation · Testing</p>
                            </div>
                        </div>
                    </section>

                    {/* EXPERIENCE - IMPACT DRIVEN */}
                    <section className={styles.editorialSection}>
                        <h2 className={styles.sectionLabel}>Professional Experience</h2>

                        <div className={styles.experienceItem}>
                            <div className={styles.expHeader}>
                                <div>
                                    <h3 className={styles.expTitle}>Logistics Operations Specialist</h3>
                                    <span className={styles.expCompany}>Amazon</span>
                                </div>
                                <span className={styles.expDate}>2024 – Present</span>
                            </div>
                            <p className={styles.expDescription}>
                                Operating within high-volume logistics environments under strict performance and accuracy standards.
                            </p>
                            <ul className={styles.impactList}>
                                <li>Consistently maintained productivity targets within tight SLA environments.</li>
                                <li>Developed high discipline, process adherence, and an efficiency-first mindset in fast-paced operational systems.</li>
                            </ul>
                        </div>

                        <div className={styles.experienceItem}>
                            <div className={styles.expHeader}>
                                <div>
                                    <h3 className={styles.expTitle}>Full Stack Developer (Bootcamp Winner)</h3>
                                    <span className={styles.expCompany}>LocalMarket (Project)</span>
                                </div>
                                <span className={styles.expDate}>2024</span>
                            </div>
                            <p className={styles.expDescription}>
                                Designed and implemented a full stack platform connecting local businesses with customers.
                            </p>
                            <div className={styles.expDetailBox}>
                                <strong>Challenge:</strong> Build a scalable CRUD platform with real-time state consistency.<br />
                                <strong>Solution:</strong> Developed a modular frontend architecture in React and built RESTful backend services with Node.js.<br />
                                <strong>Impact:</strong> Delivered a production-ready MVP awarded as the top project in the cohort.
                            </div>
                        </div>

                        <div className={styles.experienceItem}>
                            <div className={styles.expHeader}>
                                <div>
                                    <h3 className={styles.expTitle}>Full Stack Developer</h3>
                                    <span className={styles.expCompany}>Personal Project: Nutritionist Portal</span>
                                </div>
                                <span className={styles.expDate}>2024</span>
                            </div>
                            <p className={styles.expDescription}>
                                Targeted professional platform focused on performance and SEO optimization.
                            </p>
                            <ul className={styles.impactList}>
                                <li>Built modular frontend components with React and Next.js.</li>
                                <li>Implemented server-side rendering and optimized asset delivery for high performance.</li>
                                <li>Structured for long-term maintainability using modular architecture principles.</li>
                            </ul>
                        </div>
                    </section>

                    {/* EDUCATION */}
                    <section className={styles.editorialSection}>
                        <h2 className={styles.sectionLabel}>Education</h2>
                        <Row className="g-4">
                            <Col md={6}>
                                <div className={styles.eduCard}>
                                    <h3>Software Developer</h3>
                                    <span className={styles.eduOwner}>42 Madrid — Fundación Telefónica</span>
                                    <p>Algorithms, data structures, and peer-to-peer development in intensive environments.</p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className={styles.eduCard}>
                                    <h3>Full Stack Web Development</h3>
                                    <span className={styles.eduOwner}>Neoland Boutique School</span>
                                    <p>Advanced React architecture, Redux, Node.js REST APIs and modular system design.</p>
                                </div>
                            </Col>
                        </Row>
                    </section>

                    {/* PHILOSOPHY */}
                    <section className={styles.editorialSection}>
                        <h2 className={styles.sectionLabel}>Engineering Philosophy</h2>
                        <div className={styles.philosophyGrid}>
                            <div className={styles.principle}>
                                <strong>Pragmatic Scalability</strong>
                                <p>Prefer modular monoliths over premature microservices to maintain development velocity.</p>
                            </div>
                            <div className={styles.principle}>
                                <strong>Data-Driven Optimization</strong>
                                <p>Always optimize based on measurement and profiling, not on assumptions.</p>
                            </div>
                            <div className={styles.principle}>
                                <strong>Clean Abstraction</strong>
                                <p>Strictly separate business logic from presentation layers to ensure testability and reuse.</p>
                            </div>
                        </div>
                    </section>

                </Container>
            </div>
        </MainLayout>
    );
};

export default CVPage;
