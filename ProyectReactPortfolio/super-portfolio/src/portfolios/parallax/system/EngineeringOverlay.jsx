// @ts-nocheck
import useEngineeringMetrics from "../hooks/useEngineeringMetrics";
import "./EngineeringOverlay.css";

export default function EngineeringOverlay({ isVisible }) {
  const metrics = useEngineeringMetrics();

  if (!isVisible) return null;

  return (
    <aside className="engineering-overlay">

      <h3>Engineering Dashboard</h3>

      {metrics.sections.map(section => (
        <section key={section.id} className="overlay-section">
          <h4>{section.title}</h4>

          {Object.entries(section.data).map(([key, value]) => (
            <div key={key} className="overlay-row">
              <strong>{key}</strong>
              <p>{value}</p>
            </div>
          ))}
        </section>
      ))}

      <section className="overlay-section philosophy">
        <h4>Philosophy</h4>
        <ul>
          {metrics.philosophy.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

    </aside>
  );
}