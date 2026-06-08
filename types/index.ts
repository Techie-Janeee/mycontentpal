export type Platform = "TikTok" | "Instagram";

export type Action =
  | "content-audit"
  | "idea-generation"
  | "strategy-recommendation"
  | "competitor-insights";

export type GenerateInput = {
  description?: string;
  niche: string;
  platform: Platform;
  action: Action;
};

export type ContentAuditResult = {
  positioning: string;
  improvements: string[];
};

export type IdeaGenerationResult = {
  ideas: Array<{ hook: string; caption: string; format: string }>;
};

export type StrategyResult = {
  actions: Array<{ priority: number; action: string; reason: string }>;
};

export type CompetitorResult = {
  patterns: Array<{ pattern: string; example: string; takeaway: string }>;
};

export type GenerateOutput = {
  action: Action;
  result: ContentAuditResult | IdeaGenerationResult | StrategyResult | CompetitorResult;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  inputData: GenerateInput;
  outputData: GenerateOutput;
  createdAt: string;
};
