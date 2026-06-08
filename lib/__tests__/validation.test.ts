import { describe, it, expect } from "vitest";
import { GenerateInputSchema } from "@/lib/validation";

describe("GenerateInputSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "fitness for busy moms",
      platform: "Instagram",
      action: "idea-generation",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with description", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "vegan cooking",
      platform: "TikTok",
      action: "content-audit",
      description: "I post 3 times a week",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty niche", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "",
      platform: "Instagram",
      action: "strategy-recommendation",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid platform", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "fitness",
      platform: "YouTube",
      action: "idea-generation",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "fitness",
      platform: "Instagram",
      action: "invalid-action",
    });
    expect(result.success).toBe(false);
  });

  it("rejects niche longer than 200 chars", () => {
    const result = GenerateInputSchema.safeParse({
      niche: "a".repeat(201),
      platform: "Instagram",
      action: "competitor-insights",
    });
    expect(result.success).toBe(false);
  });
});
