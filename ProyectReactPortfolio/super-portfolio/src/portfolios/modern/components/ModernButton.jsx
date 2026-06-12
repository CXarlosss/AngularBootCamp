// @ts-nocheck
import styles from "./modern.button.module.css";

export default function ModernButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  disabled = false,
  ...props
}) {
  const classNames = [
    styles["modern-button"],
    styles[`modern-button--${variant}`],
    styles[`modern-button--${size}`],
    fullWidth && styles["modern-button--full"],
    disabled && styles["modern-button--disabled"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
