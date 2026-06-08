import { describe, it, expect } from "vitest";
import { sanitize, isVagueNiche, formatDate, truncate } from "@/lib/utils";

describe("sanitize", () => {
  it("strips HTML tags", () => {
    expect(sanitize("<script>alert('xss')</script>hello")).toBe("alert('xss')hello");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(sanitize("")).toBe("");
    expect(sanitize(undefined as any)).toBe("");
    expect(sanitize(null as any)).toBe("");
  });

  it("passes through clean text", () => {
    expect(sanitize("fitness for busy moms")).toBe("fitness for busy moms");
  });
});

describe("isVagueNiche", () => {
  it("returns true for short input", () => {
    expect(isVagueNiche("abc")).toBe(true);
  });

  it("returns true for known vague terms", () => {
    expect(isVagueNiche("lifestyle")).toBe(true);
    expect(isVagueNiche("business")).toBe(true);
  });

  it("returns false for specific niche", () => {
    expect(isVagueNiche("fitness for busy moms")).toBe(false);
    expect(isVagueNiche("vegan cooking on a budget")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(isVagueNiche("LIFESTYLE")).toBe(true);
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-06-15T12:00:00Z");
    expect(result).toMatch(/Jun 1[55], 2024/);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-01-01"));
    expect(result).toMatch(/Jan 1, 2024/);
  });
});

describe("truncate", () => {
  it("returns string as-is when under limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when over limit", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...");
  });
});
