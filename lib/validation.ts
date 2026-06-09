import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const GenerateInputSchema = z.object({
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  niche: z.string().min(2, "Niche must be at least 2 characters").max(200, "Niche must be less than 200 characters").trim(),
  platform: z.enum(["TikTok", "Instagram"] as const),
  action: z.enum([
    "content-audit",
    "idea-generation",
    "strategy-recommendation",
    "competitor-insights",
  ] as const),
});
