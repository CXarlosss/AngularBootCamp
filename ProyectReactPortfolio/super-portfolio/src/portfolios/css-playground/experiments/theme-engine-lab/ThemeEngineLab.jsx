// @ts-nocheck
import { useState, useEffect } from "react";
import styles from "./themeEngineLab.module.css";

const themes = {
  neon: {
    "--play-bg": "#0b0f1a",
    "--play-accent-blue": "#00e0ff",
    "--play-accent-purple": "#8a2cff",
  },
  cyber: {
    "--play-bg": "#111111",
    "--play-accent-blue": "#ff00ff",
    "--play-accent-purple": "#00ff88",
  },
  minimal: {
    "--play-bg": "#181818",
    "--play-accent-blue": "#ffffff",
    "--play-accent-purple": "#aaaaaa",
  },
  solar: {
    "--play-bg": "#1a120b",
    "--play-accent-blue": "#ffb703",
    "--play-accent-purple": "#fb8500",
  },
  aurora: {
    "--play-bg": "#0f2027",
    "--play-accent-blue": "#00f5d4",
    "--play-accent-purple": "#9b5de5",
  },
};

const ThemeEngineLab = () => {
  const [activeTheme, setActiveTheme] = useState("neon");

  useEffect(() => {
    const savedTheme = localStorage.getItem("play-theme");
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme);
    } else {
      applyTheme("neon");
    }
  }, []);

  const applyTheme = (themeName) => {
    const theme = themes[themeName];

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem("play-theme", themeName);
    setActiveTheme(themeName);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Theme Engine Lab</h1>

      <p className={styles.subtitle}>
        Runtime CSS token manipulation demonstrating scalable design system
        architecture.
      </p>

      <div className={styles.controls}>
        {Object.keys(themes).map((theme) => (
          <button
            key={theme}
            onClick={() => applyTheme(theme)}
            className={`${styles.themeButton} ${
              activeTheme === theme ? styles.active : ""
            }`}
          >
            {theme}
          </button>
        ))}
      </div>

      <div className={styles.activeIndicator}>
        Active Theme: <span>{activeTheme}</span>
      </div>

      <div className={styles.preview}>
        <div className={styles.box}>Live Theme Preview</div>
      </div>

      <div className={styles.explanation}>
        <h3>What this demonstrates</h3>
        <ul>
          <li>Dynamic CSS variable system</li>
          <li>Token-based design architecture</li>
          <li>Theme persistence</li>
          <li>Runtime visual system control</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeEngineLab;
