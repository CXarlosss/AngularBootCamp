// @ts-nocheck
import { useState } from "react";
import styles from "./architectureLab.module.css";

const ArchitectureLab = () => {
  const [layout, setLayout] = useState("grid");

  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    height: 80 + Math.random() * 120,
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Architecture Lab</h1>

      <p className={styles.subtitle}>
        Dynamic layout engine comparison: Grid vs Flex vs Masonry.
        Demonstrates structural adaptability and layout system awareness.
      </p>

      <div className={styles.controls}>
        <button
          onClick={() => setLayout("grid")}
          className={layout === "grid" ? styles.active : ""}
        >
          Grid
        </button>

        <button
          onClick={() => setLayout("flex")}
          className={layout === "flex" ? styles.active : ""}
        >
          Flex
        </button>

        <button
          onClick={() => setLayout("masonry")}
          className={layout === "masonry" ? styles.active : ""}
        >
          Masonry
        </button>
      </div>

      <div className={`${styles.layoutContainer} ${styles[layout]}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            style={{ height: `${item.height}px` }}
          >
            Card {item.id + 1}
          </div>
        ))}
      </div>

      <div className={styles.explanation}>
        <h3>What this demonstrates</h3>
        <ul>
          <li>Runtime layout switching</li>
          <li>CSS Grid structural control</li>
          <li>Flexbox flow behavior</li>
          <li>Masonry-like column behavior</li>
          <li>Separation between state and layout engine</li>
        </ul>
      </div>
    </div>
  );
};

export default ArchitectureLab;
