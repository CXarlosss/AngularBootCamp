// @ts-nocheck
import { useCallback } from "react";

export default function useFocusEngine(nodeRefs, containerRef) {
  const focusNode = useCallback((nodeId) => {
    const element = nodeRefs.current[nodeId];
    const container = containerRef?.current;

    if (!element) return;

    // Scroll node into view vertically
    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }, [nodeRefs, containerRef]);

  return { focusNode };
}