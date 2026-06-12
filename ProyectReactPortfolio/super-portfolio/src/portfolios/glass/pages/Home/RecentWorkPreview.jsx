// @ts-nocheck

import React from 'react';
import styles from '../../styles/components/home/recentWorkPreview.module.css';
import ProjectThumbnail from '../../common/ProjectThumbnail.jsx';
import Button from '../../common/Button.jsx'; // Assuming you have a Button component

// Import your project images
import localMarketImage1 from '../../../../assets/images/Proyecto1-2.png';
import localMarketImage2 from '../../../../assets/images/Proyecto1.png';
import productivityAppImage1 from '../../../../assets/images/Proyecto2.png';
import productivityAppImage2 from '../../../../assets/images/Proyecto2-1.png';
import movieAppImage1 from '../../../../assets/images/Proyecto3.png';
import movieAppImage2 from '../../../../assets/images/Proyecto3-1.png';

function RecentWorkPreview() {
  const projects = [
    {
      title: 'LocalMarket',
      description: 'Plataforma web innovadora para conectar pequeños comercios con clientes locales.',
      images: [localMarketImage1, localMarketImage2],
      link: 'https://flourishing-baklava-adefd3.netlify.app/',
    },
    {
      title: 'Página de Productividad',
      description: 'Aplicación web para guardar tareas y crear un calendario de productividad.',
      images: [productivityAppImage1, productivityAppImage2],
      link: 'https://harmonious-fudge-8adaba.netlify.app/',
    },
    {
      title: 'App de Películas',
      description: 'Aplicación para ver las películas actuales en el cine y obtener información de IBM.',
      images: [movieAppImage1, movieAppImage2],
      link: 'https://chimerical-platypus-822400.netlify.app/',
    }
  ];

  return (
    <section className={styles.recentWork}>
      <h2 className={styles.mainTitle}>Proyectos Recientes</h2> {/* Añadida clase para el título principal */}
      <div className={styles.projectsGrid}>
        {projects.map((project, index) => (
          <ProjectThumbnail key={index} {...project} />
        ))}
      </div>
      <div className={styles.projectsButtonContainer}> {/* Nuevo contenedor para el botón */}
        <Button link="/portfolio" variant="secondary"> {/* Usando el variant 'secondary' del botón */}
          Ver Todos los Proyectos
        </Button>
      </div>
    </section>
  );
}

export default RecentWorkPreview;
