// @ts-nocheck
import "./CommandBar.css";

export default function CommandBar({
  mode,
  toggleMode,
  toggleMetrics
}) {
  return (
    <header className="command-bar">

      <div className="command-section left">
        <span className="system-name">
          ARCH-SYSTEM
        </span>
        <span className="system-id">
          carlos.de.petronila
        </span>
      </div>

      <div className="command-section center">
        <span className="status-indicator online" />
        <span className="mode-label">
          MODE: {mode.toUpperCase()}
        </span>
      </div>

      <div className="command-section right">
        <button onClick={toggleMode}>
  {mode === "architecture" ? "RECRUITER VIEW" : "ARCHITECTURE VIEW"}
</button>
        <button onClick={toggleMetrics}>METRICS</button>
      </div>

    </header>
  );
}