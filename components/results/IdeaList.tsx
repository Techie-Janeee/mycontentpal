"use client";

import { IdeaGenerationResult } from "@/types";
import styles from "./ResultStyles.module.css";

export function IdeaList({ data, onItemClick }: { data: IdeaGenerationResult; onItemClick?: (label: string) => void }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Content Ideas</h3>
      <div className={styles.grid}>
        {data.ideas.map((idea, idx) => (
          <button
            key={idx}
            className={styles.clickableCard}
            onClick={() => onItemClick?.(`Idea: ${idea.hook}`)}
          >
            <div className={styles.badge}>{idea.format}</div>
            <h4 className={styles.cardTitle}>{idea.hook}</h4>
            <p className={styles.cardText}>{idea.caption}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
