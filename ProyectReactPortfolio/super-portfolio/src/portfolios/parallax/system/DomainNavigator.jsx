// @ts-nocheck
import "./DomainNavigator.css";
import { universe } from "../data/universeData";

export default function DomainNavigator({
  selectedDomain,
  onSelectDomain
}) {
  return (
    <aside className="domain-navigator">

      <div className="domain-title">
        DOMAINS
      </div>

      <div className="domain-list">
        {universe.domains.map(domain => (
          <div
            key={domain.id}
            className={`domain-item ${
              selectedDomain === domain.id ? "active" : ""
            }`}
            onClick={() => onSelectDomain(domain.id)}
          >
            <span className="domain-dot" />
            {domain.label}
          </div>
        ))}
      </div>

    </aside>
  );
}