// @ts-nocheck
import React, { createContext, useState, useRef, useEffect } from "react";

export const RetroSystemContext = createContext();

export const RetroSystemProvider = ({ children }) => {
  const [portfolioUnlocked, setPortfolioUnlocked] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [accessState, setAccessState] = useState("locked");
  // locked | unlocking | granted | unlocked

  const timeouts = useRef([]);

  /* =============================
     CONFIGURABLE TIMINGS
  ============================= */

  const TIMINGS = {
    glitchDuration: 600,
    grantedDelay: 1800,
    fullUnlockDelay: 2600,
  };

  /* =============================
     CLEAR TIMEOUTS SAFELY
  ============================= */

  const clearAllTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  /* =============================
     UNLOCK SEQUENCE
  ============================= */

  const unlockPortfolio = () => {
    if (portfolioUnlocked || accessState !== "locked") return;

    setAccessState("unlocking");
    setGlitch(true);

    // Stop initial glitch
    timeouts.current.push(
      setTimeout(() => {
        setGlitch(false);
      }, TIMINGS.glitchDuration)
    );

    // Access granted moment
    timeouts.current.push(
      setTimeout(() => {
        setAccessState("granted");
      }, TIMINGS.grantedDelay)
    );

    // Fully unlocked
    timeouts.current.push(
      setTimeout(() => {
        setPortfolioUnlocked(true);
        setAccessState("unlocked");
      }, TIMINGS.fullUnlockDelay)
    );
  };

  /* =============================
     OPTIONAL: RESET SYSTEM
  ============================= */

  const resetSystem = () => {
    clearAllTimeouts();
    setPortfolioUnlocked(false);
    setAccessState("locked");
    setGlitch(false);
  };

  return (
    <RetroSystemContext.Provider
      value={{
        portfolioUnlocked,
        glitch,
        accessState,
        unlockPortfolio,
        resetSystem, // 🔥 ahora puedes reiniciar
      }}
    >
      {children}
    </RetroSystemContext.Provider>
  );
};
