import React from "react";
import { useDimension } from "../../context/DimensionContext";
import styles from "./DimensionToggle.module.css";

const DimensionToggle = () => {
    const { dimension, changeDimension } = useDimension();

    const themes = [
        { id: "standard", label: "Core" },
        { id: "modern", label: "Modern" },
        { id: "retro", label: "Retro" },
        { id: "glass", label: "Glass" }
    ];

    return (
        <div className={styles.toggleWrapper}>
            <span className={styles.label}>DISPLAY_MODE:</span>
            <div className={styles.btnGroup}>
                {themes.map((theme) => (
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
    );
};

export default DimensionToggle;
