// @ts-nocheck
import { useState } from "react";

import "./ParallaxPortfolio.css";
import ParallaxCanvas from "./ParallaxCanvas";

import useViewMode from "../hooks/useViewMode";
import RecruiterView from "../system/RecruiterView";
import EngineeringOverlay from "../system/EngineeringOverlay";
import CommandBar from "../system/CommandBar";
import { useParallaxSystem } from "../context/ParallaxSystemContext";

export default function ParallaxApp() {
  const {
    showMetrics,
    setShowMetrics
  } = useParallaxSystem();

  const {
    mode,
    isArchitecture,
    toggleMode
  } = useViewMode();

  return (
<div className={`parallax-root ${isArchitecture ? "arch-mode" : "recruiter-mode"}`}>
      <CommandBar
        mode={mode}
        toggleMode={toggleMode}
        toggleMetrics={() =>
          setShowMetrics(prev => !prev)
        }
      />

      {isArchitecture && <ParallaxCanvas />}
      {!isArchitecture && <RecruiterView />}

      <EngineeringOverlay isVisible={showMetrics} />

    </div>
  );
}