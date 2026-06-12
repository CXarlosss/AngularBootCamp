import { Routes, Route } from "react-router-dom";
import { RetroSystemProvider } from "./pages/context/RetroSystemContext";
import RetroLayout from "./RetroLayout";

import RetroHome from "./pages/Home";
import RetroAbout from "./pages/About";
import RetroContact from "./pages/Contact";
import RetroCurriculum from "./pages/Curriculum";
import RetroPortfolioPage from "./pages/Portfolio";

const RetroPortfolio = () => {
  return (
    <RetroSystemProvider>
      <Routes>
        <Route element={<RetroLayout />}>
          <Route index element={<RetroHome />} />
          <Route path="about" element={<RetroAbout />} />
          <Route path="contact" element={<RetroContact />} />
          <Route path="curriculum" element={<RetroCurriculum />} />
          <Route path="portfolio" element={<RetroPortfolioPage />} />
        </Route>
      </Routes>
    </RetroSystemProvider>
  );
};

export default RetroPortfolio;
