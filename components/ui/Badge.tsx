import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
