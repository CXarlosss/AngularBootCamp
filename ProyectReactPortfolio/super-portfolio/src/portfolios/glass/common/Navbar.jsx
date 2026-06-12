// @ts-nocheck
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from './navbar.module.css';
import { FaBars, FaTimes, FaArrowLeft } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuId = 'primary-navigation';

  // HOME REAL de la app (considerando que el portfolio glass está en /portfolio/glass)
  const basePath = '/portfolio/glass';
  const isHome = location.pathname === basePath || location.pathname === basePath + '/';

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(v => !v);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    return () => document.body.classList.remove('nav-open');
  }, [isMenuOpen]);

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} role="navigation" aria-label="Menú principal">

        <div className={styles.leftSection}>

          {!isHome && (
            <button
              className={styles.backButton}
              onClick={() => navigate(basePath)}
              aria-label="Volver al inicio"
            >
              <FaArrowLeft />
              <span>Inicio</span>
            </button>
          )}

          <div
            className={styles.logo}
            onClick={() => navigate(basePath)}
            role="button"
            tabIndex={0}
          >
            Carlos de Petronila
          </div>

        </div>

        <button
          className={`${styles.menuToggle} ${isMenuOpen ? styles.menuToggleOpen : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul
          id={menuId}
          className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}
        >
          <li>
            <NavLink to={`${basePath}`} end onClick={closeMenu}>
              Inicio
            </NavLink>
          </li>

          <li>
            <NavLink to={`${basePath}/about`} onClick={closeMenu}>
              Sobre Mí
            </NavLink>
          </li>

          <li>
            <NavLink to={`${basePath}/portfolio`} onClick={closeMenu}>
              Portfolio
            </NavLink>
          </li>

          <li>
            <NavLink to={`${basePath}/curriculum`} onClick={closeMenu}>
              Curriculum
            </NavLink>
          </li>

          <li>
            <NavLink to={`${basePath}/contact`} onClick={closeMenu}>
              Contacto
            </NavLink>
          </li>
        </ul>

      </nav>

      {isMenuOpen && (
        <button
          className={styles.backdrop}
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}