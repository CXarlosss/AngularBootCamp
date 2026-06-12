import React from "react";
import { NavLink } from "react-router-dom";

const PlaygroundNavbar = () => {
  return (
    <nav className="play-navbar">
      <div className="play-logo">SYSTEMS LAB</div>

      <div className="play-nav-links">
        <NavLink to="" end>
          Lab Home
        </NavLink>

        <NavLink to="labs">
          Experiments
        </NavLink>

        <NavLink to="/" style={{ opacity: 0.5, borderLeft: '1px solid #333', marginLeft: '10px', paddingLeft: '15px' }}>
          Back to Core
        </NavLink>
      </div>
    </nav>
  );
};

export default PlaygroundNavbar;
