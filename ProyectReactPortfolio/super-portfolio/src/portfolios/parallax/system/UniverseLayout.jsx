// @ts-nocheck
import useUniverseLayout from "../hooks/useUniverseLayout";
import useUniverseLayoutAlgorithm from "../hooks/useUniverseLayoutAlgorithm";
import useConnections from "../hooks/useConnections";
import useInspector from "../hooks/useInspector";
import InspectorPanel from "./InspectorPanel";
import UniverseLayer from "./UniverseLayer";

export default function UniverseLayout() {
  const { orderedDomains, connections, getNodeById } =
    useUniverseLayout();

  const layoutDomains =
    useUniverseLayoutAlgorithm(orderedDomains);

  const { registerNode, paths } =
    useConnections(connections);

  const {
    activeNodeId,
    openInspector,
    closeInspector
  } = useInspector();

  const activeNode =
    activeNodeId ? getNodeById(activeNodeId) : null;

  return (
    <div className="universe-root">

      {/* CONNECTION LAYER */}
      <svg className="universe-connections">
        {paths.map(path => (
          <path
            key={path.id}
            d={path.d}
            className="connection-path"
          />
        ))}
      </svg>

      {/* DOMAIN LAYER */}
      <div className="universe-layout">
        {layoutDomains.map(domain => (
          <UniverseLayer
            key={domain.id}
            domain={domain}
            registerNode={registerNode}
            openInspector={openInspector}
          />
        ))}
      </div>

      {/* INSPECTOR */}
      <InspectorPanel
        node={activeNode}
        onClose={closeInspector}
      />

    </div>
  );
}