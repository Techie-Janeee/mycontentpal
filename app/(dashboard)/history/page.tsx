import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ResultCard } from "@/components/results/ResultCard";
import { ErrorBoundary } from "@/components/features/ErrorBoundary";
import type { GenerateOutput, GenerateInput } from "@/types";
import styles from "./page.module.css";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  const sessions = await prisma.contentSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Your past generated content strategies.</p>
      </header>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t generated any strategies yet.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {sessions.map((item) => {
            const inputData = item.inputData as GenerateInput;
            const outputData = item.outputData as GenerateOutput;

            return (
              <div key={item.id} className={styles.historyCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.badges}>
                    <Badge variant="primary">{inputData.action}</Badge>
                    <Badge variant="secondary">{inputData.platform}</Badge>
                  </div>
                  <span className={styles.date}>{formatDate(item.createdAt)}</span>
                </div>
                <div className={styles.niche}>
                  <strong>Niche:</strong> {inputData.niche}
                </div>
                <div className={styles.resultPreview}>
                  <ErrorBoundary>
                    <ResultCard output={outputData} />
                  </ErrorBoundary>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
