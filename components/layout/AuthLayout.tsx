import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import styles from "./AuthLayout.module.css";
import Link from "next/link";

export type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        MyContentPal
      </Link>
      <Card className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </Card>
    </div>
  );
}
