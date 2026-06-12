// @ts-nocheck
import React from "react";
import styles from "./Button.module.css";

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button"
}) {
  const buttonStyle = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      className={buttonStyle}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
