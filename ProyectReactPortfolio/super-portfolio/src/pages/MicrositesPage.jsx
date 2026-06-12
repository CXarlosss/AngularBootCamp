// @ts-nocheck
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import "./MicrositesPage.css";

// Reutilizamos datos para la galería
import heroGlass from "../assets/images/hero_glass.png";
import heroModern from "../assets/images/hero_modern.png";
import heroRetro from "../assets/images/hero_retro.png";
import heroCreative from "../assets/images/hero_creative.png";

const MICROSITES_DATA = [
    {
        id: "01",
        type: "GLASS",
        title: "Translucent Clarity",
        description: "Exploring depth through layered refraction and blurred boundaries.",
        img: heroGlass,
        path: "/portfolio/glass",
        category: "Glass"
    },
    {
        id: "02",
        type: "RETRO",
        title: "Phosphor Dreams",
        description: "The digital nostalgia of terminal interfaces and analog signals.",
        img: heroRetro,
        path: "/portfolio/retro",
        category: "Retro"
    },
    {
        id: "03",
        type: "MODERN",
        title: "Minimal Precision",
        description: "Geometric perfection and bold hierarchy defining the new era.",
        img: heroModern,
        path: "/portfolio/modern",
        category: "Modern"
    },
    {
        id: "04",
        type: "CREATIVE",
        title: "Liquid Flow",
        description: "Organic transitions and ethereal color spectrums in motion.",
        img: heroCreative,
        path: "/portfolio/creative",
        category: "Creative"
    },
    {
        id: "05",
        type: "PARALLAX",
        title: "Layered Infinity",
        description: "Deep spatial storytelling through multi-plane motion mechanics.",
        img: heroGlass, // Placeholder for parallax
        path: "/portfolio/parallax",
        category: "Parallax"
    },
    {
        id: "06",
        type: "CSS",
        title: "Tactile Interface",
        description: "Soft extrusion and realistic light play for sensory interaction.",
        img: heroModern, // Placeholder for neumorphism
        path: "/portfolio/css-playground",
        category: "CSS"
    }
];

const CATEGORIES = ["All Dimensions", "Glass", "Retro", "Modern", "Creative", "Parallax"];

const MicrositesPage = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("All Dimensions");

    const filteredMicrosites = filter === "All Dimensions"
        ? MICROSITES_DATA
        : MICROSITES_DATA.filter(m => m.category === filter);

    return (
        <MainLayout>
            <div className="microsites-page-wrapper">
                <Container>
                    {/* HEADER */}
                    <div className="microsites-header">
                        <h1 className="museum-title">
                            Digital Museum <br />
                            of <span className="highlight-green">Dimensions</span>
                        </h1>
                        <p className="museum-subtitle">
                            Explore our curated gallery of microsites, each inhabiting its own
                            unique visual reality. From retro-phosphor aesthetics to fluid abstract
                            dimensions.
                        </p>
                    </div>

                    {/* FILTERS */}
                    <div className="filter-container">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* GALLERY GRID */}
                    <Row className="gallery-grid g-4">
                        {filteredMicrosites.map((site) => (
                            <Col lg={4} md={6} key={site.id}>
                                <div
                                    className={`gallery-card card-${site.type.toLowerCase()}`}
                                    onClick={() => navigate(site.path)}
                                >
                                    <div className="card-visual">
                                        <img src={site.img} alt={site.title} />
                                        <div className="card-overlay"></div>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-meta">{site.id} / {site.type}</div>
                                        <h3 className="card-title">{site.title}</h3>
                                        <p className="card-desc">{site.description}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>

                {/* CUSTOM FOOTER (As shown in image) */}
                <footer className="gallery-footer">
                    <Container className="footer-flex">
                        <div className="footer-logo">
                            <div className="logo-dot"></div>
                            <span>Antigravity</span>
                        </div>
                        <div className="footer-info">
                            © 2024 Antigravity Digital Studio. All dimensions reserved.
                        </div>
                        <div className="footer-icons">
                            <span className="icon">🌐</span>
                            <span className="icon">{"<>"}</span>
                            <span className="icon">✉️</span>
                        </div>
                    </Container>
                </footer>
            </div>
        </MainLayout>
    );
};

export default MicrositesPage;
