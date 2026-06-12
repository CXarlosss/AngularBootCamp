// @ts-nocheck
import styles from "./modern.card.module.css";


export default function ModernCard({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  as: Component = "div",
  className = "",
  ...props
}) {
  const classNames = [
    styles["modern-card"],
    styles[`modern-card--${variant}`],
    styles[`modern-card--padding-${padding}`],
    hover && styles["modern-card--hover"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
}
