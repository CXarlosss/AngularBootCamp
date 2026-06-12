// @ts-nocheck
import { useMemo } from "react";
import { universe } from "../data/universeData";

export default function useUniverseLayout() {
  return useMemo(() => {
    const { domains, nodes, connections } = universe;

    /* ------------------------------------------------
       1️⃣ Create Domain Map
    ------------------------------------------------ */
    const domainMap = {};
    domains.forEach(domain => {
      domainMap[domain.id] = {
        ...domain,
        nodes: []
      };
    });

    /* ------------------------------------------------
       2️⃣ Create Node Map
    ------------------------------------------------ */
    const nodeMap = {};
    nodes.forEach(node => {
      nodeMap[node.id] = node;

      if (domainMap[node.domain]) {
        domainMap[node.domain].nodes.push(node);
      }
    });

    /* ------------------------------------------------
       3️⃣ Sort Domains by Order
    ------------------------------------------------ */
    const orderedDomains = Object.values(domainMap).sort(
      (a, b) => a.order - b.order
    );

    /* ------------------------------------------------
       4️⃣ Connection Validation (Optional but Senior)
    ------------------------------------------------ */
    const validatedConnections = connections.filter(
      conn => nodeMap[conn.from] && nodeMap[conn.to]
    );

    /* ------------------------------------------------
       5️⃣ Exposed API
    ------------------------------------------------ */
    const getNodesByDomain = (domainId) =>
      domainMap[domainId]?.nodes || [];

    const getNodeById = (nodeId) =>
      nodeMap[nodeId] || null;

    return {
      orderedDomains,
      domainMap,
      nodeMap,
      connections: validatedConnections,
      getNodesByDomain,
      getNodeById
    };
  }, []);
}