// @ts-nocheck
import "./UniverseNode.css";

export default function UniverseNode({ node, registerNode, openInspector }) {
  return (
    <div
      className="dashboard-node"
      ref={(el) => registerNode(node.id, el)}
      onClick={() => openInspector(node.id)}
    >
      <div className="node-title">{node.title}</div>
      {node.subtitle && (
        <div className="node-subtitle">{node.subtitle}</div>
      )}
    </div>
  );
}