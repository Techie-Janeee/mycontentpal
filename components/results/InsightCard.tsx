"use client";

import { CompetitorResult } from "@/types";
import styles from "./ResultStyles.module.css";

export function InsightCard({ data, onItemClick }: { data: CompetitorResult; onItemClick?: (label: string) => void }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Competitor Insights</h3>
      <div className={styles.grid}>
        {data.patterns.map((item, idx) => (
          <button
            key={idx}
            className={styles.clickableCard}
            onClick={() => onItemClick?.(`Insight: ${item.pattern}`)}
          >
            <h4 className={styles.cardTitle}>{item.pattern}</h4>
            <p className={styles.cardText}><strong>Example:</strong> {item.example}</p>
            <p className={styles.cardText}><strong>Takeaway:</strong> {item.takeaway}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
