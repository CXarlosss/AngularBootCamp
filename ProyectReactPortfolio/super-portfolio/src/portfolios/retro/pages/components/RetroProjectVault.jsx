// @ts-nocheck
import React, { useContext, useState } from "react";
import { RetroSystemContext } from "../context/RetroSystemContext";
import { PROJECTS } from "../../../creative/data/projects";

import "../styles/retro.vault.css";

const RetroProjectVault = () => {
  const { portfolioUnlocked } = useContext(RetroSystemContext);
  const [executingId, setExecutingId] = useState(null);

  const handleClick = (project) => {
    if (!portfolioUnlocked) return;

    // ⚡ activar glitch visual
    setExecutingId(project.id);

    setTimeout(() => {
      window.open(project.liveDemoLink || project.githubLink, "_blank");
      setExecutingId(null);
    }, 600); // duración glitch
  };

  return (
    <div className={`retro-vault ${portfolioUnlocked ? "unlocked" : ""}`}>
      {PROJECTS.slice(0, 6).map((project, index) => (
        <div
          key={project.id}
          className={`retro-vault-card ${
            executingId === project.id ? "executing" : ""
          }`}
          style={{
            top: `${10 + index * 12}%`,
            left: index % 2 === 0 ? "10%" : "72%",
            animationDelay: `${index * 0.2}s`,
          }}
          onClick={() => handleClick(project)}
        >
          <div className="vault-title">
            [{project.title.toUpperCase()}]
          </div>

          <div className="vault-stack">
            {project.technologies.slice(0, 3).join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RetroProjectVault;
