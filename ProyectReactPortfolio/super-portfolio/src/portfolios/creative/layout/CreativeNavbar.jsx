// @ts-nocheck
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

function CreativeNavbar() {
  return (
    <nav className="creative-navbar">

      <motion.div
        className="creative-logo"
        whileHover={{ x: -6, y: -6 }}
      >
        CΔRLØS
      </motion.div>

      <div className="creative-nav-links">
        <NavItem to="." label="HOME" />
        <NavItem to="about" label="ABOUT" />
        <NavItem to="portfolio" label="WORK" />
        <NavItem to="curriculum" label="CV" />
        <NavItem to="contact" label="CONTACT" />
      </div>
    </nav>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink to={to} end className="creative-nav-item">
      {({ isActive }) => (
        <motion.div
          className={`creative-nav-block ${isActive ? "active" : ""}`}
          whileHover={{ x: -4, y: -4 }}
        >
          {label}
        </motion.div>
      )}
    </NavLink>
  );
}

export default CreativeNavbar;
