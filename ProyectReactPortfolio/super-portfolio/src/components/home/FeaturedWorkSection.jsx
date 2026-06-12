import React from "react";
import { Container } from "react-bootstrap";
import { BsArrowRight } from "react-icons/bs";
import styles from "./FeaturedWorkSection.module.css";

const PROJECTS = [
    {
        id: "NUTRI_01",
        title: "Nutritionist Portal",
        context: "Next.js ecosystem optimized for SEO and content scalability.",
        impact: "Clean architecture with production-ready Vercel deployment.",
        tags: ["Next.js", "TypeScript"],
    },
    {
        id: "OP_TASK",
        title: "OP_Task System",
        context: "Role-based project management with TanStack Query state sync.",
        impact: "Predictable state flow in a complex multi-role environment.",
        tags: ["React", "State Sync"],
    },
    {
        id: "LOCAL_01",
        title: "LocalMarket MVP",
        context: "Full-stack marketplace connecting businesses with local customers.",
        impact: "Awarded 'Best Project' for technical execution and architecture.",
        tags: ["Node.js", "MongoDB"],
    }
];

const FeaturedWorkSection = () => {
    return (
        <section className={styles.projectsSection}>
            <Container>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.title}>Selected Work</h2>
                    <p className={styles.subtitle}>Engineering teasers. Detailed case studies available in Projects.</p>
                </div>

                <div className={styles.projectList}>
                    {PROJECTS.map((project) => (
                        <div key={project.id} className={styles.projectCard}>
                            <div className={styles.cardContent}>
                                <div className={styles.head}>
                                    <span className={styles.id}>[ {project.id} ]</span>
                                    <h3>{project.title}</h3>
                                    <p className={styles.contextLine}>{project.context}</p>
                                </div>
                                <div className={styles.impactBox}>
                                    <span className={styles.arrow}>→</span>
                                    <p className={styles.impact}>{project.impact}</p>
                                </div>
                                <div className={styles.footer}>
                                    <div className={styles.tags}>
                                        {project.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                                    </div>
                                    <a href="/projects" className={styles.viewStudy}>
                                        View Study <BsArrowRight />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default FeaturedWorkSection;
