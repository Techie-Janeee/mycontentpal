"use client";

import { StrategyResult } from "@/types";
import styles from "./ResultStyles.module.css";

export function StrategyBlock({ data, onItemClick }: { data: StrategyResult; onItemClick?: (label: string) => void }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Top 3 Priority Actions</h3>
      <div className={styles.grid}>
        {data.actions.map((action, idx) => (
          <button
            key={idx}
            className={styles.clickableCard}
            onClick={() => onItemClick?.(`Strategy: ${action.action}`)}
          >
            <div className={styles.badge}>Priority {action.priority}</div>
            <h4 className={styles.cardTitle}>{action.action}</h4>
            <p className={styles.cardText}>{action.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
