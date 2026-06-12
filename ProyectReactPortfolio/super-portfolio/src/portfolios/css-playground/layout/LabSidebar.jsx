import React from "react";
import { useDimension } from "../../../context/DimensionContext";
import styles from "./LabSidebar.module.css";

const LabSidebar = () => {
    const { dimension, changeDimension } = useDimension();

    const themes = [
        { id: "standard", label: "Core" },
        { id: "modern", label: "Modern" },
        { id: "retro", label: "Retro" },
        { id: "glass", label: "Glass" }
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <div className={styles.header}>
                    <span>UI_ENGINE_VR4.0</span>
                </div>
                <p className={styles.description}>
                    Testing decoupling between design tokens and architectural layers.
                </p>
                <div className={styles.btnList}>
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            className={`${styles.themeBtn} ${dimension === theme.id ? styles.active : ""}`}
                            onClick={() => changeDimension(theme.id)}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.statusBox}>
                <div className={styles.statusItem}>
                    <span>ACTIVE_DIMENSION</span>
                    <span className={styles.value}>{dimension.toUpperCase()}</span>
                </div>
                <div className={styles.statusItem}>
                    <span>RUNTIME_OVERHEAD</span>
                    <span className={styles.value}>0.00ms</span>
                </div>
            </div>
        </aside>
    );
};

export default LabSidebar;
