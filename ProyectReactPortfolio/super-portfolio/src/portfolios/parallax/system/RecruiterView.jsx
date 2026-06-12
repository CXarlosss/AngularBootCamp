// @ts-nocheck
import useUniverseLayout from "../hooks/useUniverseLayout";
import "./RecruiterView.css";

export default function RecruiterView() {
  const { orderedDomains } = useUniverseLayout();

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="recruiter-list">
          {value.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <pre className="recruiter-json">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <p className="recruiter-text">{value}</p>;
  };

  return (
    <div className="recruiter-view">

      <div className="recruiter-container">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-eyebrow">
            SYSTEM ARCHITECTURE PORTFOLIO
          </div>

          <h1 className="hero-title">
            Carlos De Petronila
          </h1>

          <p className="hero-subtitle">
            Full Stack Engineer — Systems & Scalable Interfaces
          </p>
        </section>

        {/* ENGINEERING PHILOSOPHY */}
        <section className="philosophy-section">
          <h2 className="section-heading">
            Engineering Philosophy
          </h2>

          <div className="philosophy-grid">

            <div className="philosophy-block">
              <h3>Approach</h3>
              <p>
                I build systems — not pages. Every component and module
                exists within a defined architectural intention.
              </p>
            </div>

            <div className="philosophy-block">
              <h3>Architecture</h3>
              <p>
                Separation of concerns drives my design: data modeling,
                state orchestration, rendering logic, and presentation layer.
              </p>
            </div>

            <div className="philosophy-block">
              <h3>Values</h3>
              <ul>
                <li>Clarity over cleverness</li>
                <li>Systems over fragments</li>
                <li>Scalability over shortcuts</li>
                <li>Intentional abstraction</li>
              </ul>
            </div>

          </div>
        </section>

        {/* DYNAMIC DOMAINS */}
        {orderedDomains.map(domain => (
          <section key={domain.id} className="recruiter-section">

            <div className="recruiter-domain-title">
              {domain.label}
            </div>

            <div className="recruiter-domain-content">
              {domain.nodes.map(node => (
                <div key={node.id} className="recruiter-card">

                  <div className="recruiter-card-header">
                    <div className="recruiter-card-title">
                      {node.title}
                    </div>
                    {node.subtitle && (
                      <div className="recruiter-card-subtitle">
                        {node.subtitle}
                      </div>
                    )}
                  </div>

                  {node.metadata && (
                    <div className="recruiter-metadata">
                      {Object.entries(node.metadata).map(([key, value]) => (
                        <div key={key} className="recruiter-meta-section">

                          <div className="recruiter-meta-label">
                            {key}
                          </div>

                          <div className="recruiter-meta-value">
                            {renderValue(value)}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </section>
        ))}

      </div>

    </div>
  );
}