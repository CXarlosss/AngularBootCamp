// @ts-nocheck
import { useMemo } from "react";

/*
  Dashboard Version:
  No spatial calculations.
  No absolute positioning.
  Layout is controlled entirely by CSS structure.
*/

export default function useUniverseLayoutAlgorithm(domains) {
  return useMemo(() => {
    if (!domains) return [];

    return domains.map(domain => ({
      ...domain,
      nodes: domain.nodes.map(node => ({
        ...node
      }))
    }));
  }, [domains]);
}