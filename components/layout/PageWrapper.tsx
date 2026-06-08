import type { ReactNode } from "react";
import styles from "./PageWrapper.module.css";

export type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return <main className={`${styles.wrapper} ${className}`}>{children}</main>;
}
