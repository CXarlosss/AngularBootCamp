// @ts-nocheck
import styles from "./modern.badge.module.css";

export default function ModernSection({
  children,
  size = "default",
  background = "none",
  className = "",
}) {
  return (
    <section
      className={`
        ${styles["modern-section"]}
        ${styles[`modern-section--${size}`]}
        ${styles[`modern-section--${background}`]}
        ${className}
      `}
    >
      {children}
    </section>
  );
}
