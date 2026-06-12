// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import styles from "./projectThumbnail.module.css";

function ProjectThumbnail({
  images = [],
  title,
  description = "Proyecto sin descripción",
  link
}) {
  return (
    <a
      href={link}
      className={styles.projectThumbnail}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver proyecto: ${title}`}
    >
      <div className={styles.imageContainer}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${title} vista ${index + 1}`}
              loading="lazy"
              className={styles.thumbnailImage}
            />
          ))
        ) : (
          <div className={styles.imagePlaceholder}>Sin imagen</div>
        )}
      </div>

      <div className={styles.projectInfo}>
        <h3 className={styles.projectTitle}>{title}</h3>
        <p className={styles.projectDescription}>{description}</p>
      </div>
    </a>
  );
}

ProjectThumbnail.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  link: PropTypes.string.isRequired,
};

export default ProjectThumbnail;
