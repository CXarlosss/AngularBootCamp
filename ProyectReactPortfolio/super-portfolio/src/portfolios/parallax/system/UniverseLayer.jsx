// @ts-nocheck
import UniverseNode from "./UniverseNode";

export default function UniverseLayer({ domain, registerNode, openInspector }) {
  return (
    <section
      className="universe-layer"
      data-label={domain.label}
    >
      <div className="layer-header">
        <div className="layer-accent" />
        <h2 className="layer-title">{domain.label}</h2>
      </div>

      <div className="layer-nodes">
        {domain.nodes.map(node => (
          <UniverseNode
            key={node.id}
            node={node}
            registerNode={registerNode}
            openInspector={openInspector}
          />
        ))}
      </div>
    </section>
  );
}