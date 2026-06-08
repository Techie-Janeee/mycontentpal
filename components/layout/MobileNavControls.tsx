"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Sparkles, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import styles from "./MobileNavControls.module.css";

export function MobileNavControls() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  const handleAiClick = () => {
    window.dispatchEvent(new CustomEvent("open-chat"));
  };

  return (
    <>
      <div className={styles.icons}>
        <button type="button" className={styles.iconBtn} onClick={handleAiClick} aria-label="Open Content Pal">
          <Sparkles size={20} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Menu</span>
              <button type="button" className={styles.iconBtn} onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className={styles.drawerLinks}>
              <Link href="/dashboard" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/history" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                History
              </Link>
              <button
                type="button"
                className={`${styles.drawerLink} ${settingsOpen ? styles.settingsActive : ""}`}
                onClick={() => setSettingsOpen((s) => !s)}
              >
                Settings
              </button>

              {settingsOpen && (
                <div className={styles.settingsDropdown}>
                  <button type="button" className={styles.dropdownItem} onClick={toggleTheme}>
                    <span className={styles.dropdownItemLeft}>
                      {dark ? <Moon size={18} /> : <Sun size={18} />}
                      Theme
                    </span>
                    <span className={`${styles.toggle} ${dark ? styles.toggleOn : ""}`}>
                      <span className={styles.toggleKnob} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSettingsOpen(false);
                      setShowModal(true);
                    }}
                  >
                    <span className={styles.dropdownItemLeft}>
                      <LogOut size={18} />
                      Log out
                    </span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalText}>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={async () => {
                  setShowModal(false);
                  setMenuOpen(false);
                  await signOut({ redirect: true, callbackUrl: "/auth" });
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
