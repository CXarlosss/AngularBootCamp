// @ts-nocheck
import { useCallback } from "react";
import { useParallaxSystem } from "../context/ParallaxSystemContext";

export default function useInspector() {
  const {
    activeNodeId,
    openNode,
    closeNode
  } = useParallaxSystem();

  const isOpen = activeNodeId !== null;

  const openInspector = useCallback((nodeId) => {
    openNode(nodeId);
  }, [openNode]);

  const closeInspector = useCallback(() => {
    closeNode();
  }, [closeNode]);

  return {
    activeNodeId,
    isOpen,
    openInspector,
    closeInspector
  };
}