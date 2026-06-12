// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";

export default function useConnections(connections) {
  const nodeRegistry = useRef({});
  const containerRef = useRef(null);
  const [paths, setPaths] = useState([]);

  /* ------------------------------------------
     Register container (dashboard root)
  ------------------------------------------ */
  const registerContainer = useCallback((element) => {
    if (!element) return;
    containerRef.current = element;
  }, []);

  /* ------------------------------------------
     Register node DOM reference
  ------------------------------------------ */
  const registerNode = useCallback((id, element) => {
    if (!element) return;
    nodeRegistry.current[id] = element;
  }, []);

  /* ------------------------------------------
     Calculate connection paths
  ------------------------------------------ */
  const calculatePaths = useCallback(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newPaths = [];

    connections.forEach(conn => {
      const fromEl = nodeRegistry.current[conn.from];
      const toEl = nodeRegistry.current[conn.to];

      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Convert to container-relative coordinates
      const x1 = fromRect.right - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;

      const x2 = toRect.left - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      const controlOffset = 80;

      const d = `
        M ${x1} ${y1}
        C ${x1 + controlOffset} ${y1},
          ${x2 - controlOffset} ${y2},
          ${x2} ${y2}
      `;

      newPaths.push({
        id: `${conn.from}-${conn.to}`,
        d
      });
    });

    setPaths(newPaths);
  }, [connections]);

  /* ------------------------------------------
     Resize observer (stable recalculation)
  ------------------------------------------ */
  useEffect(() => {
    calculatePaths();

    const observer = new ResizeObserver(() => {
      calculatePaths();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [calculatePaths]);

  return {
    registerContainer,
    registerNode,
    paths
  };
}