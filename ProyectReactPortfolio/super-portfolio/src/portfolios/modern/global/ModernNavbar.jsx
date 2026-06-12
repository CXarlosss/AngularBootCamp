// @ts-nocheck
import { NavLink } from "react-router-dom";
import styles from "./modern.navbar.module.css";
import ModernContainer from "../components/ModernContainer";
import ModernButton from "../components/ModernButton";

export default function ModernNavbar() {
  return (
    <header className={styles["modern-navbar"]}>
      <ModernContainer size="wide">
        <div className={styles["modern-navbar-inner"]}>

          {/* LOGO */}
          <div className={styles["modern-logo"]}>
            CARLOS
          </div>

          {/* LINKS */}
          <nav className={styles["modern-nav-links"]}>
            <NavLink
              to="/portfolio/modern"
              end
              className={({ isActive }) =>
                `${styles["modern-nav-link"]} ${
                  isActive ? styles["active-link"] : ""
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/portfolio/modern/portfolio"
              className={({ isActive }) =>
                `${styles["modern-nav-link"]} ${
                  isActive ? styles["active-link"] : ""
                }`
              }
            >
              Portfolio
            </NavLink>

            <NavLink
              to="/portfolio/modern/about"
              className={({ isActive }) =>
                `${styles["modern-nav-link"]} ${
                  isActive ? styles["active-link"] : ""
                }`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/portfolio/modern/contact"
              className={({ isActive }) =>
                `${styles["modern-nav-link"]} ${
                  isActive ? styles["active-link"] : ""
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          <ModernButton size="sm">
            Contactar
          </ModernButton>

        </div>
      </ModernContainer>
    </header>
  );
}
