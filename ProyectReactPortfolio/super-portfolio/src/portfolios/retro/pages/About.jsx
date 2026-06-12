// @ts-nocheck
import React, { useState } from "react";
import "../styles/retro.about.css";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="retro-section">
      <div
        className={`retro-section-title ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {"> " + title.toUpperCase()} {open ? "[-]" : "[+]"}
      </div>

      {open && (
        <div className="retro-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

const RetroAbout = () => {
  return (
    <div className="retro-about-container">

      <div className="retro-about-header">
        &gt; decrypt_user_profile
      </div>

      <div className="retro-divider">
        ────────────────────────────────────────────────
      </div>

      <Section title="identity">
        <div className="retro-highlight">NAME: CARLOS DE PETRONILA RODRÍGUEZ</div>
        <div>ROLE: FULL STACK WEB DEVELOPER</div>
        <div>LOCATION: SPAIN</div>
        <div>STATUS: ACTIVE</div>
        <div>
          PRIMARY STACK: REACT · TYPESCRIPT · NODE · EXPRESS · MONGODB
        </div>
      </Section>

      <Section title="mission_statement">
        <p>
          I transform ideas into scalable, maintainable and efficient digital products.
        </p>
        <p>
          My objective is not only to build interfaces,
          but to design structured frontend systems aligned with long-term architecture decisions.
        </p>
      </Section>

      <Section title="technical_focus">
        <ul>
          <li>Multi-theme architecture systems</li>
          <li>Modular routing & layout abstraction</li>
          <li>Component scalability patterns</li>
          <li>Clean architecture principles</li>
          <li>SSR / SSG fundamentals with Next.js</li>
          <li>UX-driven performance optimization</li>
          <li>Version control discipline & structured workflows</li>
        </ul>
      </Section>

      <Section title="professional_experience">
        <div className="retro-block">
          <strong>PISCINE 42 MADRID</strong>
          <p>Algorithmic thinking, C programming and peer-driven development under pressure.</p>
        </div>

        <div className="retro-block">
          <strong>IT SUPPORT — PLENUM INGENIEROS</strong>
          <p>Hardware/software troubleshooting, deployment and operational continuity assurance.</p>
        </div>

        <div className="retro-block">
          <strong>SOLAR INSTALLATION — SIPAMA</strong>
          <p>On-site diagnostics, installations and safety protocol compliance.</p>
        </div>

        <div className="retro-block">
          <strong>LOGISTICS — INDITEX</strong>
          <p>High-volume operations and SLA-driven performance.</p>
        </div>
      </Section>

      <Section title="growth_objective">
        <p>
          Specializing in scalable frontend architectures and system-oriented design.
        </p>
        <p>
          Long-term goal: DevOps-aware engineering and infrastructure-conscious development.
        </p>
      </Section>

      <Section title="personal_traits">
        <ul>
          <li>Curious & continuous learner</li>
          <li>Analytical mindset</li>
          <li>Structured & disciplined</li>
          <li>Team-oriented collaboration</li>
          <li>Focused on long-term improvement</li>
        </ul>
      </Section>

      <div className="retro-about-footer">
        &gt; profile_loaded_successfully
      </div>

    </div>
  );
};

export default RetroAbout;
