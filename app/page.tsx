import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.appName}>MyContentPal</div>
        <h1 className={styles.heroTitle}>
          Create Better Content<br />
          With <span className={styles.highlight}>AI-Powered</span> Strategy
        </h1>
        <p className={styles.subtitle}>
          MyContentPal helps creators and business owners generate content ideas, audit their content, and build a clear strategy for Instagram and TikTok.
        </p>
        <div className={styles.actions}>
            <Link href="/auth?mode=signup">
            <Button className={styles.cta}>Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
