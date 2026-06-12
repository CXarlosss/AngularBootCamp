// @ts-nocheck
import styles from "./modern.container.module.css";


export default function ModernContainer({
  children,
  size = "default",
  className = "",
  as: Component = "div",
}) {
  const classNames = [
    styles["modern-container"],
    styles[`modern-container--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames}>
      {children}
    </Component>
  );
}
