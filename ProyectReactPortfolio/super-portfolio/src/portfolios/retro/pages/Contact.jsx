// @ts-nocheck
import React, { useState } from "react";
import "../styles/retro.contact.css";

const Channel = ({ label, href, children, onActivate }) => {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    onActivate(label);
  };

  return (
    <div className={`retro-channel ${active ? "active" : ""}`}>
      <div className="retro-channel-label">
        {"> " + label.toUpperCase()}
      </div>

      <div className="retro-channel-link">
        <a href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
          {children}
        </a>
      </div>

      {active && (
        <div className="retro-channel-status">
          {label.toUpperCase()}_PROTOCOL_INITIALIZED
        </div>
      )}
    </div>
  );
};

const RetroContact = () => {
  return (
    <div className="retro-contact-container">

      <div className="retro-contact-header">
        &gt; establish_secure_connection
      </div>

      <div className="retro-divider">
        ────────────────────────────────────────────────
      </div>

      <div className="retro-contact-info">
        <div>TARGET: CARLOS DE PETRONILA RODRÍGUEZ</div>
        <div>CHANNEL STATUS: READY</div>
        <div>ENCRYPTION LEVEL: 256-BIT</div>
        <div>FIREWALL: ACTIVE</div>
      </div>

      <div className="retro-divider">
        ────────────────────────────────────────────────
      </div>

      <div className="retro-contact-section-title">
        AVAILABLE COMMUNICATION CHANNELS
      </div>

      <Channel
        label="email"
        href="mailto:carlosdepet@gmail.com"
        onActivate={() => {}}
      >
        carlosdepet@gmail.com
      </Channel>

      <Channel
        label="github"
        href="https://github.com/CXarlosss"
        onActivate={() => {}}
      >
        github.com/CXarlosss
      </Channel>

      <Channel
        label="linkedin"
        href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
        onActivate={() => {}}
      >
        linkedin.com/in/carlos-de-petronila-rodriguez
      </Channel>

      <div className="retro-contact-footer">
        &gt; awaiting_response...
      </div>

    </div>
  );
};

export default RetroContact;
