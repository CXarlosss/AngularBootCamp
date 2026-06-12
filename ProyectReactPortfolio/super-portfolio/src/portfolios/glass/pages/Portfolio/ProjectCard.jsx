// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "../../styles/components/portfolio/projectCard.module.css";
import Button from "../../common/Button.jsx";

import {
  FaGithub,
  FaExternalLinkAlt,
  FaRegImages,
  FaReact,
  FaJsSquare,
  FaHtml5,
  FaCss3Alt,
  FaNodeJs,
  FaGitAlt,
} from "react-icons/fa";

import {
  SiRedux,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs,
  SiMongodb,
  SiExpress,
  SiVercel,
  SiVite,
  SiFramer,
  SiReactquery,
  SiZod,
} from "react-icons/si";

import { TbAppWindow } from "react-icons/tb";
import { RiSeoLine } from "react-icons/ri";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { IoLeafOutline } from "react-icons/io5";
import { GrResources } from "react-icons/gr";
import { PiChartLineUpBold } from "react-icons/pi";

import { motion, AnimatePresence } from "framer-motion";

function ProjectCard({ project, onClick }) {
  const {
    title,
    description,
    thumbnail,
    images = [],
    technologies = [],
    githubLink,
    liveDemoLink,
  } = project;

  const techIcons = {
    "React": <FaReact size={20} />,
    "JavaScript": <FaJsSquare size={20} />,
    "HTML": <FaHtml5 size={20} />,
    "CSS": <FaCss3Alt size={20} />,
    "TypeScript": <SiTypescript size={20} />,
    "Tailwind CSS": <SiTailwindcss size={20} />,
    "Next.js": <SiNextdotjs size={20} />,
    "Redux": <SiRedux size={20} />,
    "Vite": <SiVite size={20} />,
    "Framer Motion": <SiFramer size={20} />,
    "Headless UI": <MdOutlineDashboardCustomize size={20} />,
    "Lucide React": <IoLeafOutline size={20} />,
    "React Router v6": <FaReact size={20} />,
    "TanStack React Query": <SiReactquery size={20} />,
    "React Hook Form": <FaReact size={20} />,
    "Recharts": <PiChartLineUpBold size={20} />,
    "Node.js": <FaNodeJs size={20} />,
    "Express": <SiExpress size={20} />,
    "MongoDB": <SiMongodb size={20} />,
    "Zod": <SiZod size={20} />,
    "App Router": <TbAppWindow size={20} />,
    "SEO Optimizado": <RiSeoLine size={20} />,
    "Vercel": <SiVercel size={20} />,
    "Markdown": <FaGitAlt size={20} />,
    "UUID": <GrResources size={20} />,
  };

  const getTechIcon = (techName) =>
    techIcons[techName] || <FaReact size={20} />;

  const allImages = useMemo(() => {
    if (images.length > 0) return images;
    if (thumbnail) return [thumbnail];
    return ["https://placehold.co/400x300/e0e0e0/333333?text=No+Image"];
  }, [images, thumbnail]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isTechVisible, setIsTechVisible] = useState(false);

  useEffect(() => {
    if (allImages.length <= 1 || !isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allImages.length, isHovered]);

  const handleImageError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  const goToNextImage = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    },
    [allImages.length]
  );

  const goToPrevImage = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentImageIndex(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    },
    [allImages.length]
  );

  return (
    <motion.div
      className={styles.projectCard}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(project)}
      role="article"
    >
      <div className={styles.imageContainer}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={
              imageLoadError
                ? "https://placehold.co/400x300/e0e0e0/333333?text=Image+Not+Found"
                : allImages[currentImageIndex]
            }
            alt={`${title} screenshot`}
            className={styles.projectThumbnail}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onError={handleImageError}
          />
        </AnimatePresence>

        {allImages.length > 1 && (
          <>
            <div className={styles.imageNavigation}>
              <button
                className={styles.navButton}
                onClick={goToPrevImage}
              >
                ‹
              </button>
              <button
                className={styles.navButton}
                onClick={goToNextImage}
              >
                ›
              </button>
            </div>

            <div className={styles.imageCounter}>
              <FaRegImages size={14} />
              <span>
                {currentImageIndex + 1}/{allImages.length}
              </span>
            </div>
          </>
        )}

        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h3>{title}</h3>
            <p className={styles.projectDescription}>
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.projectDetails}>
        {technologies.length > 0 && (
          <>
            <div
              className={styles.techHeadingContainer}
              onClick={(e) => {
                e.stopPropagation();
                setIsTechVisible(!isTechVisible);
              }}
            >
              <h3 className={styles.techHeading}>
                Technologies
              </h3>
              <span className={styles.toggleIcon}>
                {isTechVisible ? "−" : "+"}
              </span>
            </div>

            <AnimatePresence>
              {isTechVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.techListWrapper}
                >
                  <ul className={styles.projectTechnologies}>
                    {technologies.map((tech) => (
                      <li
                        key={tech}
                        className={styles.techIconPill}
                        title={tech}
                      >
                        {getTechIcon(tech)}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <div className={styles.projectActions}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClick(project);
            }}
            variant="outline"
          >
            View Details
          </Button>

          <div className={styles.externalLinks}>
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectLink}
                onClick={(e) => e.stopPropagation()}
              >
                <FaGithub size={20} />
              </a>
            )}
            {liveDemoLink && (
              <a
                href={liveDemoLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectLink}
                onClick={(e) => e.stopPropagation()}
              >
                <FaExternalLinkAlt size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
