import { describe, it, expect, vi } from "vitest";
import type { GenerateInput } from "@/types";
import { buildPrompt, generateContent } from "@/lib/generate";

vi.mock("openai", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{ message: { content: '{"ideas":[]}' } }],
  });
  return {
    default: class {
      chat = { completions: { create: mockCreate } };
    },
  };
});

describe("buildPrompt", () => {
  const baseInput: GenerateInput = {
    niche: "fitness for busy moms",
    platform: "Instagram",
    action: "idea-generation",
  };

  it("includes platform and niche in user prompt", () => {
    const { userPrompt } = buildPrompt(baseInput);
    expect(userPrompt).toContain("Instagram");
    expect(userPrompt).toContain("fitness for busy moms");
  });

  it("includes description when provided", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      description: "I post 3x a week about home workouts",
    });
    expect(userPrompt).toContain("I post 3x a week about home workouts");
  });

  it("includes action in user prompt", () => {
    const { userPrompt } = buildPrompt(baseInput);
    expect(userPrompt).toContain("idea-generation");
  });

  it("sets system prompt to always output JSON", () => {
    const { systemPrompt } = buildPrompt(baseInput);
    expect(systemPrompt).toContain("valid JSON");
    expect(systemPrompt).toContain("no asterisks");
  });

  it("includes expected JSON format for content-audit", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      action: "content-audit",
    });
    expect(userPrompt).toContain("positioning");
    expect(userPrompt).toContain("improvements");
    expect(userPrompt).toContain("exactly 3 items");
  });

  it("includes expected JSON format for idea-generation", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      action: "idea-generation",
    });
    expect(userPrompt).toContain("hook");
    expect(userPrompt).toContain("caption");
    expect(userPrompt).toContain("format");
    expect(userPrompt).toContain("exactly 5 items");
  });

  it("includes expected JSON format for strategy-recommendation", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      action: "strategy-recommendation",
    });
    expect(userPrompt).toContain("priority");
    expect(userPrompt).toContain("action");
    expect(userPrompt).toContain("reason");
    expect(userPrompt).toContain("exactly 3 items");
  });

  it("includes expected JSON format for competitor-insights", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      action: "competitor-insights",
    });
    expect(userPrompt).toContain("pattern");
    expect(userPrompt).toContain("example");
    expect(userPrompt).toContain("takeaway");
    expect(userPrompt).toContain("3-5 items");
  });

  it("mentions platform in format instructions", () => {
    const { userPrompt } = buildPrompt({
      ...baseInput,
      platform: "TikTok",
    });
    expect(userPrompt).toContain("TikTok");
  });
});

describe("generateContent", () => {
  it("returns parsed JSON on success", async () => {
    const result = await generateContent({
      niche: "fitness",
      platform: "Instagram",
      action: "idea-generation",
    });
    expect(result).toEqual({ ideas: [] });
  });
});
