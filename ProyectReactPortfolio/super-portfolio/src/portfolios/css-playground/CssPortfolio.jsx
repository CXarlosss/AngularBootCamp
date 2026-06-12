import React from "react";
import { Routes, Route } from "react-router-dom";
import PlaygroundLayout from "./layout/PlaygroundLayout";

import Home from "./pages/Home";
import Labs from "./pages/Labs";

import ArchitectureLab from "./experiments/architecture-lab/ArchitectureLab";
import ThemeEngineLab from "./experiments/theme-engine-lab/ThemeEngineLab";
import ComponentScalabilityLab from "./experiments/component-scalability-lab/ComponentScalabilityLab";

const CssPortfolio = () => {
  return (
    <Routes>
      <Route element={<PlaygroundLayout />}>
        <Route index element={<Home />} />
        <Route path="labs" element={<Labs />} />

        <Route path="labs/architecture" element={<ArchitectureLab />} />
        <Route path="labs/theme" element={<ThemeEngineLab />} />
        <Route path="labs/scalability" element={<ComponentScalabilityLab />} />
      </Route>
    </Routes>
  );
};

export default CssPortfolio;
