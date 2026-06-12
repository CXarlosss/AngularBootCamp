// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import styles from "./componentScalabilityLab.module.css";

const ComponentScalabilityLab = () => {
  const [count, setCount] = useState(10);
  const [layout, setLayout] = useState("grid");
  const [renderTime, setRenderTime] = useState(0);
  const startTimeRef = useRef(0);

  const updateCount = (newCount) => {
    startTimeRef.current = performance.now();
    setCount(newCount);
  };

  useEffect(() => {
    const end = performance.now();
    const duration = end - startTimeRef.current;
    if (startTimeRef.current !== 0) {
      setRenderTime(duration.toFixed(2));
    }
  }, [count]);

  const items = Array.from({ length: count }, (_, i) => i);

  const getRenderCostLabel = () => {
    if (count <= 10) return "Low";
    if (count <= 100) return "Moderate";
    return "High";
  };

  return (
    <div className={styles.container}>
      <h1>UI Stress Testing Engine</h1>

      <p className={styles.subtitle}>
        Evaluate rendering cost, layout stability and structural scalability.
      </p>

      <div className={styles.controls}>
        <div className={styles.group}>
          <span>Components:</span>
          <button onClick={() => updateCount(10)}>10</button>
          <button onClick={() => updateCount(100)}>100</button>
          <button onClick={() => updateCount(1000)}>1000</button>
        </div>

        <div className={styles.group}>
          <span>Layout:</span>
          <button onClick={() => setLayout("grid")}>Grid</button>
          <button onClick={() => setLayout("flex")}>Flex</button>
        </div>
      </div>

      <div className={styles.metrics}>
        <div>
          <strong>Components:</strong> {count}
        </div>
        <div>
          <strong>Render time:</strong> {renderTime} ms
        </div>
        <div>
          <strong>Render cost:</strong> {getRenderCostLabel()}
        </div>
      </div>

      <div
        className={`${styles.layoutContainer} ${
          layout === "grid" ? styles.grid : styles.flex
        }`}
      >
        {items.map((item) => (
          <div key={item} className={styles.card}>
            {item}
          </div>
        ))}
      </div>

      <div className={styles.explanation}>
        <h3>What this demonstrates</h3>
        <ul>
          <li>Runtime render cost measurement</li>
          <li>Structural layout scalability</li>
          <li>Performance-aware UI architecture</li>
          <li>Dynamic layout engine switching</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentScalabilityLab;
