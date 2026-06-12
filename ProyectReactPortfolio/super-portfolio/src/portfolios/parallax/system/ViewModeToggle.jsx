// @ts-nocheck
import "./ViewModeToggle.css";

export default function ViewModeToggle({
  isArchitecture,
  toggleMode
}) {
  return (
    <div className="view-toggle">

      <div className="toggle-label">
        MODE
      </div>

      <div className="toggle-switch" onClick={toggleMode}>
        <div
          className={`toggle-option ${
            isArchitecture ? "active" : ""
          }`}
        >
          ARCH
        </div>

        <div
          className={`toggle-option ${
            !isArchitecture ? "active" : ""
          }`}
        >
          RECRUITER
        </div>

        <div
          className={`toggle-indicator ${
            isArchitecture ? "left" : "right"
          }`}
        />
      </div>

    </div>
  );
}