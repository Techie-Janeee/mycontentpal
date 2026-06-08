import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/SessionProviders";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <AuthProvider>
        <PageWrapper>{children}</PageWrapper>
      </AuthProvider>
    </div>
  );
}
