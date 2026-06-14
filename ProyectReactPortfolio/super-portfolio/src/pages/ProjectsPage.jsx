import React from "react";
import { Container } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import DimensionToggle from "../components/ui/DimensionToggle";
import UISkinEngine from "../components/home/UniverseArchitectureSection";
import { BsGithub, BsGlobe, BsArrowRight, BsCodeSlash } from "react-icons/bs";
import styles from "./ProjectsPage.module.css";

// TIER 1: CORE CASE STUDIES
const FEATURED_PROJECTS = [
    {
        title: "FluxForge",
        id: "CASE_01",
        tags: "React Flow · Fastify · WebSocket · QuickJS",
        context: "Visual workflow orchestrator with a secure sandbox and n8n export capabilities.",
        challenge: "Design an interactive node-based editor capable of running untrusted code securely while maintaining real-time execution logs.",
        implementation: [
            "Frontend built with <strong>React Flow</strong> and Zustand for reactive node connections.",
            "Backend powered by <strong>Fastify</strong> and <strong>WebSockets</strong> for real-time log streaming.",
            "Isolated execution environment using <strong>QuickJS</strong> to run user code safely.",
            "Full AST-based export system compatible with <strong>n8n workflows</strong>."
        ],
        impact: "Created a scalable automation engine that bridges visual programming with low-level execution safety.",
        learned: "The complexities of real-time bidirectional communication and securing untrusted JavaScript execution.",
        links: { github: "https://github.com/CXarlosss/fluxforge-web", demo: "https://flux-forge-wine.vercel.app" }
    },
    {
        title: "CodeSynapse",
        id: "CASE_02",
        tags: "Xenova Transformers · sqlite-vec · RAG · Force Graph",
        context: "100% local semantic intelligence platform for analyzing and querying code repositories.",
        challenge: "Build a highly efficient RAG system without relying on cloud APIs, keeping all intellectual property secure on the local machine.",
        implementation: [
            "Local embedding generation using <strong>Xenova Transformers</strong> directly in Node.js.",
            "Vector search engine powered by <strong>sqlite-vec</strong> for fast similarity queries.",
            "Contextual chat interface with Server-Sent Events (<strong>SSE</strong>) for real-time streaming.",
            "Interactive dependency graph visualization mapping cyclomatic complexity using <strong>Babel AST</strong>."
        ],
        impact: "Achieved 18s indexing for 150 files and 2.7s query times, all running privately without external dependencies.",
        learned: "Optimizing vector databases in SQLite and parsing Abstract Syntax Trees for deep code analysis.",
        links: { github: "https://github.com/CXarlosss/codesynapse-web", demo: "#" }
    },
    {
        title: "MarketMesh",
        id: "CASE_03",
        tags: "Angular 21 · D3.js · Fastify · WebSocket",
        context: "Predictive marketplace with real-time intelligence and advanced visualizations.",
        challenge: "Integrate a real-time predictive engine with force-directed graphs to anticipate user purchases.",
        implementation: [
            "<strong>Jaccard similarity engine</strong> for co-purchase recommendations.",
            "Real-time stock prediction forecasting hours until empty.",
            "<strong>D3.js</strong> force simulation with animated aura effects.",
            "Predictive checkout alerts with cross-sell suggestions via <strong>WebSockets</strong>."
        ],
        impact: "Transformed a static shopping experience into an interactive, predictive ecosystem.",
        learned: "Merging predictive algorithms with dynamic data visualization in Angular.",
        links: { github: "https://github.com/CXarlosss/marketmesh-web", demo: "https://marketmesh.vercel.app" }
    },
    {
        title: "LocalMarket",
        id: "CASE_04",
        tags: "Angular 21 · TypeScript · SSR · Lighthouse",
        context: "Digital marketplace designed for extreme performance and local business integration.",
        challenge: "Optimize initial load times and render blocking resources to achieve near-perfect Lighthouse scores.",
        implementation: [
            "Architected a modern SPA using <strong>Angular 21</strong> and robust state management.",
            "Implemented lazy loading and advanced asset optimization.",
            "Configurable <strong>Server-Side Rendering (SSR)</strong> capabilities for superior SEO.",
            "Awarded 'Best Project' of the cohort for technical execution and vision."
        ],
        impact: "Delivered a complete end-to-end MVP achieving a 35% load optimization and an outstanding UX.",
        learned: "Advanced Angular architectural patterns and the impact of render strategies on real-world performance.",
        links: { github: "#", demo: "#" }
    },
    {
        title: "Professional Nutritionist Portal",
        id: "CASE_05",
        tags: "Next.js · TypeScript · SEO-Driven Architecture",
        context: "Professional web platform built to support real content publishing, long-term scalability and performance.",
        challenge: "Design a modular architecture capable of handling dynamic blog content while maintaining <strong>SEO performance</strong>.",
        implementation: [
            "Built with <strong>Next.js App Router</strong> and <strong>TypeScript</strong> for type-safety.",
            "Structured dynamic routes for content scalability and performance.",
            "Implemented advanced <strong>SEO metadata strategies</strong> and asset optimization."
        ],
        impact: "Optimized load performance with clean Lighthouse results.",
        learned: "Balancing <strong>SEO strategy</strong>, developer experience and performance.",
        links: { github: "https://github.com/CXarlosss/Pagina_De_Nutricionista", demo: "https://pagina-de-nutricionista-2j9ud676x-carlos-projects-ac914b64.vercel.app/" }
    },
    {
        title: "OP_Task: Management System",
        id: "CASE_06",
        tags: "React · TypeScript · Role-Based Architecture",
        context: "Full-stack application designed to manage projects, tasks and team roles with authentication.",
        challenge: "Implement a scalable task management system with structured <strong>role permissions</strong>.",
        implementation: [
            "React + TypeScript frontend with a highly <strong>modular folder architecture</strong>.",
            "React Router v6 and <strong>TanStack Query</strong> for server state management.",
            "Full implementation of <strong>role-based logic</strong> and secure user flows."
        ],
        impact: "Successfully built a complete management dashboard with clean state flow.",
        learned: "The critical importance of <strong>predictable state flow</strong> and component isolation.",
        links: { github: "https://github.com/CXarlosss/OP_Task", demo: "https://spiffy-youtiao-e5d23a.netlify.app/" }
    }
];

// TIER 2: TECHNICAL EXPERIMENTS
const ADDITIONAL_PROJECTS = [
    {
        title: "Calorie Tracker",
        stack: "React · TypeScript · Recharts",
        description: "Modern application for food and exercise management with visual data tracking.",
        link: "https://github.com/CXarlosss/CalorieTraker.git"
    },
    {
        title: "TripCount",
        stack: "React · Node.js · Express",
        description: "Expense sharing application designed for travel groups and shared communities.",
        link: "https://github.com/CXarlosss/TripCount"
    },
    {
        title: "Cinema Hub",
        stack: "React · TMDb API · Node.js",
        description: "Movie exploration platform with real-time data ingestion and filtering.",
        link: "https://github.com/CXarlosss/Cinema"
    },
    {
        title: "Finance Control",
        stack: "React · TypeScript · Tailwind",
        description: "Intuitive personal finance manager with category tracking and real-time state.",
        link: "https://github.com/CXarlosss/control-gastos"
    },
    {
        title: "Tip Calculator",
        stack: "React · TypeScript · Vite",
        description: "Precision utility for order calculation and service fee distribution.",
        link: "https://github.com/CXarlosss/calculador-propinas"
    }
];

const ProjectsPage = () => {
    return (
        <MainLayout>
            <div className={styles.pageWrapper}>
                <Container>
                    <header className={styles.pageHeader}>
                        <div className={styles.headerMeta}>
                            <span className={styles.serial}>SELECTED_WORK_2026</span>
                            <DimensionToggle />
                        </div>
                        <h1 className={styles.pageTitle}>Case Studies</h1>
                        <p className={styles.pageSubtitle}>
                            A focused selection of technical implementations where architecture, performance, and impact meet.
                        </p>
                    </header>

                    {/* MAIN CASE STUDIES */}
                    <div className={styles.featuredList}>
                        {FEATURED_PROJECTS.map((project) => (
                            <article key={project.id} className={styles.caseStudy}>
                                <div className={styles.caseMeta}>
                                    <span className={styles.projectId}>{project.id}</span>
                                    <div className={styles.caseLinks}>
                                        <a href={project.links.github} target="_blank" rel="noreferrer"><BsGithub /></a>
                                        <a href={project.links.demo} target="_blank" rel="noreferrer"><BsGlobe /></a>
                                    </div>
                                </div>

                                <h2 className={styles.caseTitle}>{project.title}</h2>
                                <span className={styles.caseTags}>{project.tags}</span>

                                <div className={styles.caseContent}>
                                    <section className={styles.section}>
                                        <h3 className={styles.label}>Context</h3>
                                        <p dangerouslySetInnerHTML={{ __html: project.context }} />
                                    </section>

                                    <section className={styles.section}>
                                        <h3 className={styles.label}>Challenge</h3>
                                        <p dangerouslySetInnerHTML={{ __html: project.challenge }} />
                                    </section>

                                    <section className={styles.section}>
                                        <h3 className={styles.label}>Implementation</h3>
                                        <ul className={styles.bulletList}>
                                            {project.implementation.map((item, i) => (
                                                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                                            ))}
                                        </ul>
                                    </section>

                                    <div className={styles.resultsGrid}>
                                        <section className={styles.impactBox}>
                                            <h3 className={styles.smallLabel}>Impact</h3>
                                            <p dangerouslySetInnerHTML={{ __html: project.impact }} />
                                        </section>
                                        <section className={styles.learnedBox}>
                                            <h3 className={styles.smallLabel}>Key Learning</h3>
                                            <p dangerouslySetInnerHTML={{ __html: project.learned }} />
                                        </section>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* ADDITIONAL REPOSITORY */}
                    <section className={styles.additionalSection}>
                        <header className={styles.additionalHeader}>
                            <h2 className={styles.additionalTitle}>Additional Projects</h2>
                            <p>A collection of technical prototypes and targeted experiments.</p>
                        </header>

                        <div className={styles.additionalGrid}>
                            {ADDITIONAL_PROJECTS.map((project, i) => (
                                <a key={i} href={project.link} target="_blank" rel="noreferrer" className={styles.additionalCard}>
                                    <div className={styles.cardHeader}>
                                        <BsCodeSlash className={styles.cardIcon} />
                                        <BsArrowRight className={styles.arrowIcon} />
                                    </div>
                                    <h3>{project.title}</h3>
                                    <span className={styles.cardStack}>{project.stack}</span>
                                    <p>{project.description}</p>
                                </a>
                            ))}
                        </div>
                    </section>

                    <footer className={styles.engineFooter}>
                        <UISkinEngine />
                    </footer>
                </Container>
            </div>
        </MainLayout>
    );
};

export default ProjectsPage;
