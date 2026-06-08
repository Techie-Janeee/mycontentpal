import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.css";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  rightIcon?: ReactNode;
};

export function Input({
  label,
  error,
  helperText,
  rightIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ""} ${rightIcon ? styles.hasRightIcon : ""}`}
          {...props}
        />
        {rightIcon && (
          <div className={styles.rightIcon}>{rightIcon}</div>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
}
