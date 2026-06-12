// @ts-nocheck
import useUniverseLayout from "../hooks/useUniverseLayout";
import useConnections from "../hooks/useConnections";

export default function UniverseConnections() {
  const { connections } = useUniverseLayout();
  const { paths } = useConnections(connections);

  if (!paths.length) return null;

  return (
    <svg className="universe-connections">
      {paths.map(path => (
        <path
          key={path.id}
          d={path.d}
          className="connection-path"
        />
      ))}
    </svg>
  );
}