import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const rootClass = `${styles.button} ${styles[variant]} ${
    fullWidth ? styles.fullWidth : ""
  } ${className}`;

  return (
    <button className={rootClass} {...props}>
      {children}
    </button>
  );
}
