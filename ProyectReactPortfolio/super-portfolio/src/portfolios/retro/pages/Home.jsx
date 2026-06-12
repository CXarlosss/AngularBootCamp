// @ts-nocheck
// src/portfolios/retro/pages/Home.jsx
import React, { useEffect, useState } from "react";
import "../styles/retro.home.css";
import { useNavigate } from "react-router-dom";
const bootLines = [
  "> boot_matrix_protocol",
  "Initializing core systems...",
  "Loading identity module...",
  "Authenticating user...",
  "Connection established.",
];

const RetroHome = () => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [bootFinished, setBootFinished] = useState(false);
const navigate = useNavigate();
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (index >= bootLines.length) return prev;
        return [...prev, bootLines[index]];
      });

      index++;

      if (index === bootLines.length) {
        clearInterval(interval);

        // pequeño delay dramático
        setTimeout(() => {
          setBootFinished(true);
        }, 800);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="retro-home">

      {/* BOOT SEQUENCE */}
      <div className="retro-boot-block">
        {visibleLines.map((line, i) => (
          <div key={i} className="retro-boot-line boot-appear">
            {line}
          </div>
        ))}
      </div>

      {bootFinished && (
        <div className="retro-after-boot fade-in">

          <div className="retro-spacer" />

          {/* SYSTEM STATUS */}
          <div className="retro-status-block">
            <div className="retro-highlight">
              ACCESS LEVEL: <span className="retro-green">USER</span>
            </div>
            <div className="retro-highlight">
              SECURITY PROTOCOL: <span className="retro-green">ACTIVE</span>
            </div>
            <div className="retro-highlight">
              SYSTEM STATUS: <span className="retro-green">STABLE</span>
            </div>
          </div>

          <div className="retro-divider-line" />

          {/* WELCOME */}
          <div className="retro-welcome">
            Welcome to the Matrix Interface.
          </div>

          <div className="retro-subtext">
            Direct navigation through encrypted modules enabled.
          </div>

          <div className="retro-spacer" />

          {/* COMMANDS */}
          <div className="retro-command-header">
            Available modules:
          </div>
<div
  className="retro-command-list clickable"
  onClick={() => navigate("/portfolio/retro/about")}
>
  ├── about
</div>

<div
  className="retro-command-list clickable"
  onClick={() => navigate("/portfolio/retro/curriculum")}
>
  ├── curriculum
</div>

<div
  className="retro-command-list clickable"
  onClick={() => navigate("/portfolio/retro/portfolio")}
>
  ├── portfolio
</div>

<div
  className="retro-command-list clickable"
  onClick={() => navigate("/portfolio/retro/contact")}
>
  └── contact
</div>

          <div className="retro-spacer" />

          <div className="retro-system-message">
            Awaiting command<span className="cursor" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroHome;
