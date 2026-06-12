import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DimensionProvider } from "./context/DimensionContext";

// Core Components
import HomePage from "./pages/HomePage";
import CVPage from "./pages/CVPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";

// Special Experiences (Lab)

// UX: Loading Fallback
const LoadingFallback = () => (
   <div style={{
      height: '100vh', width: '100vw', background: '#0a0c0b',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      color: '#25f46a', fontFamily: 'monospace', letterSpacing: '4px'
   }}>
      SYSTEM_RESTORING...
   </div>
);

function App() {
   return (
      <BrowserRouter>
         <DimensionProvider>
            <Suspense fallback={<LoadingFallback />}>
               <Routes>
                  {/* UNIFIED CORE ROUTES */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cv" element={<CVPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* EXPERIMENTAL LAB DISABLED BY USER REQUEST */}
                  {/* <Route path="/lab/*" element={<CssPortfolio />} /> */}
               </Routes>
            </Suspense>
         </DimensionProvider>
      </BrowserRouter>
   );
}

export default App;
