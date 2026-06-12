import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { BsList, BsX } from "react-icons/bs";
import "./Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`top-navbar ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
      <Container className="navbar-content">
        <div className="navbar-logo">
          <NavLink to="/" onClick={closeMenu}>
            <div className="logo-dot"></div>
            <span>Carlos D.P.</span>
          </NavLink>
        </div>

        {/* Desktop Links */}
        <div className="navbar-center-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/cv">CV</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        <div className="navbar-cta">
          <NavLink to="/contact" className="hire-button" onClick={closeMenu}>
            Work With Me
          </NavLink>
          
          <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMobileMenuOpen ? <BsX size={28} /> : <BsList size={28} />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-links">
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/cv" onClick={closeMenu}>CV</NavLink>
          <NavLink to="/projects" onClick={closeMenu}>Projects</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
          <NavLink to="/contact" className="mobile-hire-btn" onClick={closeMenu}>
            Work With Me
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
