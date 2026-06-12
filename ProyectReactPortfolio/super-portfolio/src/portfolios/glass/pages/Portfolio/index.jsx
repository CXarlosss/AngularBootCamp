// @ts-nocheck
import React from 'react';
import ProjectGrid from './ProjectGrid';
import styles from '../../styles/pages/PortfolioPage.module.css';

function PortfolioPage() {
  return (
    <div className={styles.portfolioPage}>
      {/* Elementos decorativos flotantes */}
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      
      <div className={styles.portfolioContentWrapper}>
        <h1>Mi Portfolio</h1>
        
        <div className={styles.portfolioIntro}>
          <p>Bienvenido a mi portfolio de proyectos. Aquí encontrarás una selección de mis trabajos más recientes y destacados.</p>
        </div>
        
        <div className={styles.portfolioStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>9</span>
            <span className={styles.statLabel}>Proyectos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>15+</span>
            <span className={styles.statLabel}>Tecnologías</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Responsive</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>∞</span>
            <span className={styles.statLabel}>Creatividad</span>
          </div>
        </div>
        
        <div className={styles.portfolioFilters}>
          <button className={styles.filterButton}>Todos</button>
          <button className={styles.filterButton}>React</button>
          <button className={styles.filterButton}>TypeScript</button>
          <button className={styles.filterButton}>Full Stack</button>
        </div>
        
        <ProjectGrid />
      </div>
    </div>
  );
}

export default PortfolioPage;