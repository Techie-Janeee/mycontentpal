"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { Sun, Moon, LogOut } from "lucide-react";
import styles from "./NavbarClient.module.css";

export function NavbarSettingsBtn() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setDark(isDark);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <>
      <div className={styles.wrapper} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.navBtn} ${open ? styles.navBtnActive : ""}`}
          onClick={() => setOpen((s) => !s)}
        >
          Settings
        </button>

        {open && (
          <div className={styles.dropdown}>
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
                setOpen(false);
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
      </div>

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
