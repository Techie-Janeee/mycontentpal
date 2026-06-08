"use client";

import { ContentAuditResult } from "@/types";
import styles from "./ResultStyles.module.css";

export function AuditResult({ data, onItemClick }: { data: ContentAuditResult; onItemClick?: (label: string) => void }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Positioning Summary</h3>
      <p className={styles.paragraph}>{data.positioning}</p>

      <h3 className={styles.title}>Key Improvements</h3>
      <ul className={styles.list}>
        {data.improvements.map((item, idx) => (
          <li key={idx}>
            <button
              className={styles.clickableItem}
              onClick={() => onItemClick?.(`Improvement: ${item}`)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
