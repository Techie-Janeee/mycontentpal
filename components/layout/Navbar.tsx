import Link from "next/link";
import styles from "./Navbar.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MobileNavControls } from "./MobileNavControls";
import { NavbarSettingsBtn } from "./NavbarClient";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          MyContentPal
        </Link>

        <div className={styles.desktopLinks}>
          {session?.user ? (
            <div className={styles.navLinks}>
              <Link href="/dashboard" className={styles.link}>
                Dashboard
              </Link>
              <Link href="/history" className={styles.link}>
                History
              </Link>
              <NavbarSettingsBtn />
            </div>
          ) : (
            <div className={styles.navLinks}>
              <Link href="/auth" className={styles.link}>
                Log in
              </Link>
              <Link href="/auth?mode=signup" className={`${styles.link} ${styles.cta}`}>
                Get Started
              </Link>
            </div>
          )}
        </div>

        <MobileNavControls />
      </div>
    </nav>
  );
}
