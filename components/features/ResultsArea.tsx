"use client";

import type { GenerateOutput } from "@/types";
import { ResultCard } from "@/components/results/ResultCard";
import styles from "./ResultsArea.module.css";

type ResultsAreaProps = {
  isGenerating: boolean;
  outputData: GenerateOutput | null;
  onItemClick?: (label: string) => void;
};

export function ResultsArea({ isGenerating, outputData, onItemClick }: ResultsAreaProps) {
  if (isGenerating) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Analyzing your content...</p>
        </div>
      </div>
    );
  }

  if (!outputData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Your insights will appear here. Fill in your details above and hit Generate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        <ResultCard output={outputData} onItemClick={onItemClick} />
      </div>
    </div>
  );
}
