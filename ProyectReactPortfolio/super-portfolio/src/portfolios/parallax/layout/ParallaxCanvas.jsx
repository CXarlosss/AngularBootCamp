// @ts-nocheck
import "./ParallaxCanvas.css";
import { useParallaxSystem } from "../context/ParallaxSystemContext";

import UniverseLayout from "../system/UniverseLayout";
import UniverseConnections from "../system/UniverseConnections";

export default function ParallaxCanvas() {
  const {
    activeNode,
    focusedNode,
    selectedDomain
  } = useParallaxSystem();

  return (
    <section className="parallax-canvas">

      {/* System Grid Background */}
      <div className="parallax-canvas-grid" />

      {/* Connection Layer (under nodes) */}
      <UniverseConnections />

      {/* Main Architecture Layout */}
      <UniverseLayout
        activeNode={activeNode}
        focusedNode={focusedNode}
        selectedDomain={selectedDomain}
      />

    </section>
  );
}