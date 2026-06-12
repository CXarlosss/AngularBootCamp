// @ts-nocheck
import { useMemo } from "react";

export default function useUniverseStructure(domains) {
  return useMemo(() => {
    if (!domains) return [];

    // Sort domains by defined order
    const ordered = [...domains].sort((a, b) => {
      return (a.order ?? 0) - (b.order ?? 0);
    });

    // Attach empty layout placeholder (dashboard-safe)
    return ordered.map(domain => ({
      ...domain,
      layout: {
        mode: "stacked"
      }
    }));
  }, [domains]);
}