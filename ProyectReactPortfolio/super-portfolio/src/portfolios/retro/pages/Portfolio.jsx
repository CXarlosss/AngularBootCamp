// @ts-nocheck
import React, { useEffect, useState } from "react";
import { PROJECTS } from "../../creative/data/projects";
import "../styles/retro.portfolio.css";

const RetroPortfolioPage = () => {
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [bootComplete, setBootComplete] = useState(false);

  /* Cinematic boot sequence */
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (PROJECTS[index]) {
        setVisibleProjects((prev) => [...prev, PROJECTS[index]]);
      }
      index++;

      if (index === PROJECTS.length) {
        clearInterval(interval);
        setTimeout(() => setBootComplete(true), 600);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

 const handleExecute = (project) => {
  if (!project) return;

  setActiveProject(project);

  setTimeout(() => {
    const url = project.liveDemoLink || project.githubLink;
    if (url) {
      window.location.href = url;
    }
  }, 800);
};



  return (
    <div className="retro-portfolio-container">
      <div className="retro-overlay" />

      <div className="retro-portfolio-header">
        &gt; INITIALIZING_PROJECT_MODULES
        <span className="cursor">█</span>
      </div>

      <div className="retro-portfolio-grid">
        {visibleProjects.map((project, i) => (
          <div
            key={project?.id || i}
            className={`retro-portfolio-card ${
              activeProject?.id === project?.id ? "executing" : ""
            }`}
            onClick={() => handleExecute(project)}
          >
            <div className="retro-card-title">{project?.title}</div>

            <div className="retro-card-sub">
              {project?.description}
            </div>

            <div className="retro-card-action">
              &gt; EXECUTE_MODULE
            </div>
          </div>
        ))}
      </div>

      <div className="retro-portfolio-footer">
        {!bootComplete
          ? "> boot_sequence_running_"
          : activeProject
          ? "> executing_module_"
          : "> select_module_to_execute_"}
        <span className="cursor">█</span>
      </div>
    </div>
  );
};

export default RetroPortfolioPage;
