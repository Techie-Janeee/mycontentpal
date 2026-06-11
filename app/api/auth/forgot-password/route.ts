import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail, hashToken } from "@/lib/email";
import { validateRequestOrigin, validateBodySize } from "@/lib/csrf";
import { authRatelimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const originCheck = validateRequestOrigin(req);
  if (originCheck !== true) { audit("csrf.blocked", { route: "forgot-password", ip: req.headers.get("x-forwarded-for") ?? "unknown" }); return originCheck; }

  const sizeCheck = validateBodySize(req);
  if (sizeCheck !== true) { audit("body-too-large", { route: "forgot-password" }); return sizeCheck; }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(ip);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "forgot-password", ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    audit("forgot-password.request", { email: parsed.success ? parsed.data.email : "invalid", ip });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hashed = hashToken(token);
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashed,
          resetTokenExpiry: expiry,
        },
      });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
