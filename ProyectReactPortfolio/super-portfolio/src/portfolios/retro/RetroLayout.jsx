import React, { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import MatrixRain from "./MatrixRain";
import { RetroSystemContext } from "./pages/context/RetroSystemContext";
import RetroProjectVault from "./pages/components/RetroProjectVault";
import "./retro.css";

const RetroLayout = () => {
  const { unlockPortfolio, portfolioUnlocked } = useContext(RetroSystemContext);

  return (
    <div className="retro-root">
      <MatrixRain />
      {/* 🔥 EL VAULT VA AQUÍ */}
      <RetroProjectVault />
      <header className="retro-header">
        <div className="retro-logo">[ C:\USER\CARLOS\_MATRIX ]</div>

        <nav className="retro-nav">
          <Link to="/portfolio/retro">HOME</Link>
          <Link to="/portfolio/retro/about">ABOUT</Link>
          <Link to="/portfolio/retro/curriculum">CV</Link>
          <Link to="/portfolio/retro/portfolio">PROJECTS</Link>
          <Link to="/portfolio/retro/contact">CONTACT</Link>
        </nav>
      </header>

      <main className="retro-main">
        <div className="retro-terminal">
          <div className="retro-terminal-bar">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="terminal-title">MATRIX PORTFOLIO v3.0</span>
          </div>

          <div className="retro-terminal-body">
            {!portfolioUnlocked && (
              <div className="retro-unlock-wrapper">
                <div className="retro-lock-message">
                  PROJECT VAULT ENCRYPTED
                </div>

                <button className="retro-unlock-btn" onClick={unlockPortfolio}>
                  🔓 INITIATE ACCESS PROTOCOL
                </button>
              </div>
            )}

            {portfolioUnlocked && (
              <div className="retro-access-granted">ACCESS GRANTED.</div>
            )}

            <Outlet />
          </div>
        </div>
      </main>

      <footer className="retro-footer">SYSTEM ACTIVE_</footer>
    </div>
  );
};

export default RetroLayout;
