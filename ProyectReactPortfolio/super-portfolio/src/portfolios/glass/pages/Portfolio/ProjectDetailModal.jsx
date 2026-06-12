// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styles from '../../styles/components/portfolio/projectDetailModal.module.css';
// No longer need to import the icons if we're not using them
// import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';

const ProjectDetailModal = ({ project, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const {
    title = 'Project Details',
    longDescription = 'No description available.',
    images = [],
    technologies = [],
    githubLink,
    liveDemoLink,
  } = project || {};

  const imageList = useMemo(() => {
    return images.length > 0 ? images : ['https://placehold.co/800x600/e0e0e0/333333?text=Image+Not+Found'];
  }, [images]);

  // Handle modal close behavior
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Add a class for the fade-out animation
    overlayRef.current?.classList.add(styles.fadeOut);
    document.body.style.overflow = ''; // Restore body scroll

    setTimeout(() => {
      onClose(); // Call the parent's onClose function after the animation
    }, 400); // Wait for the fadeOut animation to complete
  }, [onClose]);

  // Handle keyboard events (Escape key)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  // Handle clicks outside the modal content
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Manage body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Carousel navigation
  const navigateCarousel = useCallback((direction) => {
    setCurrentImageIndex((prev) => {
      const newIndex = direction === 'next'
        ? (prev + 1) % imageList.length
        : (prev - 1 + imageList.length) % imageList.length;
      return newIndex;
    });
  }, [imageList.length]);

  if (!project) return null;

  return (
    // The 'open' class is now controlled by a prop from the parent component.
    // The parent should only render this component when it needs to be open.
    <div ref={overlayRef} className={`${styles.modalOverlay} ${isClosing ? styles.fadeOut : styles.open}`}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button
          onClick={handleClose}
          className={styles.modalCloseButton}
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <div className={styles.modalContent}>
          <div className={styles.headerSection}>
            <h2 className={styles.projectTitle}>{title}</h2>
            <p className={styles.projectDescription}>{longDescription}</p>
          </div>

          {imageList.length > 0 && (
            <div className={styles.carousel}>
              <div className={styles.carouselImageContainer}>
                <img
                  src={imageList[currentImageIndex]}
                  alt={title}
                  className={styles.carouselImage}
                />
              </div>
              {imageList.length > 1 && (
                <div className={styles.carouselNavContainer}>
                  <button
                    className={styles.navButton}
                    onClick={() => navigateCarousel('prev')}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <div className={styles.carouselIndicator}>
                    {imageList.map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.indicatorDot} ${index === currentImageIndex ? styles.active : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ir a la imagen ${index + 1}`}
                      ></span>
                    ))}
                  </div>
                  <button
                    className={styles.navButton}
                    onClick={() => navigateCarousel('next')}
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={styles.technologiesSection}>
            <h3 className={styles.subheading}>Tecnologías utilizadas</h3>
            <ul className={styles.modalTechnologies}>
              {technologies.map((tech) => (
                <li key={tech} className={styles.techPill}>
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.modalLinks}>
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                Código en GitHub
              </a>
            )}
            {liveDemoLink && (
              <a href={liveDemoLink} target="_blank" rel="noopener noreferrer" className={styles.linkButtonPrimary}>
                Ver Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;