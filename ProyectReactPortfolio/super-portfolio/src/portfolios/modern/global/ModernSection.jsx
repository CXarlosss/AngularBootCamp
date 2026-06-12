// @ts-nocheck
import styles from "./modern.section.module.css";

export default function ModernSection({
  children,
  size = "default",
  background = "none",
  className = "",
  as: Component = "section",
  id,
}) {
  const classNames = [
    styles["modern-section"],
    styles[`modern-section--${size}`],
    styles[`modern-section--${background}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component id={id} className={classNames}>
      {children}
    </Component>
  );
}
