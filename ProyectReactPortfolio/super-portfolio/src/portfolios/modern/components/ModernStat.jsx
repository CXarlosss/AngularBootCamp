// @ts-nocheck
import styles from "./modern.stat.module.css";


export default function ModernStat({
  value,
  label,
  description,
  align = "left",
  variant = "default",
  className = "",
  as: Component = "div",
}) {
  const classNames = [
    styles["modern-stat"],
    styles[`modern-stat--${align}`],
    styles[`modern-stat--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames}>
      <div className={styles["modern-stat-value"]}>
        {value}
      </div>

      <div className={styles["modern-stat-label"]}>
        {label}
      </div>

      {description && (
        <div className={styles["modern-stat-description"]}>
          {description}
        </div>
      )}
    </Component>
  );
}
