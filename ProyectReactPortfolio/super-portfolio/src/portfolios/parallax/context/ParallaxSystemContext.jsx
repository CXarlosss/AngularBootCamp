// @ts-nocheck
import { createContext, useContext, useState, useMemo } from "react";

const ParallaxSystemContext = createContext(null);

export function ParallaxSystemProvider({ children }) {
  /* ===============================
     NODE STATE
  ============================== */

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  /* ===============================
     DOMAIN STATE
  ============================== */

  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [collapsedDomains, setCollapsedDomains] = useState({});

  /* ===============================
     SYSTEM UI STATE
  ============================== */

  const [showMetrics, setShowMetrics] = useState(false);

  /* ===============================
     ACTIONS
  ============================== */

  const toggleDomainCollapse = (domainId) => {
    setCollapsedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const openNode = (nodeId) => {
    setActiveNodeId(nodeId);
  };

  const closeNode = () => {
    setActiveNodeId(null);
  };

  /* ===============================
     CONTEXT VALUE
  ============================== */

  const value = useMemo(() => ({
    /* node */
    activeNodeId,
    focusedNodeId,
    openNode,
    closeNode,
    setFocusedNodeId,

    /* domain */
    selectedDomainId,
    setSelectedDomainId,
    collapsedDomains,
    toggleDomainCollapse,

    /* system */
    showMetrics,
    setShowMetrics
  }), [
    activeNodeId,
    focusedNodeId,
    selectedDomainId,
    collapsedDomains,
    showMetrics
  ]);

  return (
    <ParallaxSystemContext.Provider value={value}>
      {children}
    </ParallaxSystemContext.Provider>
  );
}

export function useParallaxSystem() {
  const context = useContext(ParallaxSystemContext);

  if (!context) {
    throw new Error("useParallaxSystem must be used within ParallaxSystemProvider");
  }

  return context;
}