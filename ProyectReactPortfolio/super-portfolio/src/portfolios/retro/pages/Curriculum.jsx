// @ts-nocheck
import React, { useState, useEffect } from "react";
import "../styles/retro.curriculum.css";

const modulesData = {
  profile: [
    "STATUS: ACTIVE",
    "PROFILE: FULL STACK DEVELOPER",
    "STACK: React · TypeScript · Node · MongoDB",
  ],
  skills: [
    "React / TypeScript",
    "Next.js / Tailwind",
    "Node.js / Express",
    "MongoDB",
  ],
  academic: [
    "Piscine 42 Madrid",
    "C Programming & Algorithms",
    "Peer-to-peer evaluation model",
  ],
  experience: [
    "Logistics Operations — INDITEX",
    "Solar Installation — SIPAMA",
    "IT Support — PLENUM INGENIEROS",
  ],
  objective: [
    "Frontend system design",
    "Scalable architectures",
    "DevOps-aware development mindset",
  ],
};

const RetroCurriculum = () => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [visibleSections, setVisibleSections] = useState([]);

  // GLOBAL LOADING BAR
  useEffect(() => {
    if (phase !== "loading") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("booting"), 400);
          return 100;
        }
        return prev + 3;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // SEQUENTIAL MODULE INIT
  useEffect(() => {
    if (phase !== "booting") return;

    const modules = Object.keys(modulesData);

    modules.forEach((module, index) => {
      setTimeout(() => {
        setVisibleSections((prev) => [...prev, module]);
      }, 800 + index * 900);
    });

    setTimeout(
      () => setPhase("ready"),
      800 + modules.length * 900
    );
  }, [phase]);

const renderBar = () => {
  const totalBlocks = 25;

  // 🔥 Blindaje absoluto
  const safeProgress = Math.min(100, Math.max(0, progress));

  const rawFilled = (safeProgress / 100) * totalBlocks;

  const filledBlocks = Math.min(
    totalBlocks,
    Math.max(0, Math.floor(rawFilled))
  );

  const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);

  return (
    "[" +
    "█".repeat(filledBlocks) +
    " ".repeat(emptyBlocks) +
    `] ${safeProgress}%`
  );
};



  return (
    <div className="retro-cv-container">

      <div className="retro-cv-boot-header">
        &gt; SYSTEM_BOOT_SEQUENCE
      </div>

      {phase === "loading" && (
        <>
          <div className="retro-cv-loading">
            Loading memory sectors...
          </div>
          <div className="retro-cv-progress">
            {renderBar()}
          </div>
        </>
      )}

      {phase !== "loading" &&
        visibleSections.map((section) => (
          <div key={section} className="retro-cv-module">

            <div className="retro-cv-section-title">
              &gt; INITIALIZING_{section.toUpperCase()}
            </div>

            <div className="retro-cv-section-content">
              {modulesData[section].map((line, i) => (
                <div key={i}>• {line}</div>
              ))}
            </div>

          </div>
        ))}

      {phase === "ready" && (
        <div className="retro-cv-ready">
          SYSTEM READY.
          <div>&gt; user_profile_loaded_successfully</div>
        </div>
      )}
    </div>
  );
};

export default RetroCurriculum;
