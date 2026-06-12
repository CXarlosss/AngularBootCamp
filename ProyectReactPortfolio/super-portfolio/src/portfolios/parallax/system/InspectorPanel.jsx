// @ts-nocheck
import "./InspectorPanel.css";

export default function InspectorPanel({
  node,
  onClose
}) {
  if (!node) return null;

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="inspector-list">
          {value.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <pre className="inspector-json">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <span>{value}</span>;
  };

  return (
    <aside className="inspector-panel">

      <div className="inspector-header">

        <div className="inspector-identity">
          <div className="inspector-node-id">
            {node.id}
          </div>
          <div className="inspector-title">
            {node.title}
          </div>
        </div>

        <button
          className="inspector-close"
          onClick={onClose}
        >
          ✕
        </button>

      </div>

      <div className="inspector-body">

        {node.metadata &&
          Object.entries(node.metadata).map(([key, value]) => (
            <div key={key} className="inspector-section">

              <div className="inspector-label">
                {key}
              </div>

              <div className="inspector-value">
                {renderValue(value)}
              </div>

            </div>
          ))}

      </div>

    </aside>
  );
}