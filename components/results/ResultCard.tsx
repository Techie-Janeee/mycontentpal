"use client";

import { GenerateOutput } from "@/types";
import { AuditResult } from "./AuditResult";
import { IdeaList } from "./IdeaList";
import { StrategyBlock } from "./StrategyBlock";
import { InsightCard } from "./InsightCard";

export function ResultCard({ output, onItemClick }: { output: GenerateOutput; onItemClick?: (label: string) => void }) {
  switch (output.action) {
    case "content-audit":
      return <AuditResult data={output.result as any} onItemClick={onItemClick} />;
    case "idea-generation":
      return <IdeaList data={output.result as any} onItemClick={onItemClick} />;
    case "strategy-recommendation":
      return <StrategyBlock data={output.result as any} onItemClick={onItemClick} />;
    case "competitor-insights":
      return <InsightCard data={output.result as any} onItemClick={onItemClick} />;
    default:
      return null;
  }
}
