import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { passwordSchema } from "@/lib/validation";
import { validateRequestOrigin, validateBodySize } from "@/lib/csrf";
import { authRatelimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { hashToken } from "@/lib/email";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export async function POST(req: NextRequest) {
  const originCheck = validateRequestOrigin(req);
  if (originCheck !== true) { audit("csrf.blocked", { route: "reset-password", ip: req.headers.get("x-forwarded-for") ?? "unknown" }); return originCheck; }

  const sizeCheck = validateBodySize(req);
  if (sizeCheck !== true) { audit("body-too-large", { route: "reset-password" }); return sizeCheck; }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(ip);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "reset-password", ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const hashed = hashToken(token);

    const user = await prisma.user.findUnique({
      where: { resetToken: hashed },
    });

    if (!user || !user.resetTokenExpiry) {
      audit("reset-password.failure", { reason: "invalid_token", ip });
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (user.resetTokenExpiry < new Date()) {
      audit("reset-password.failure", { reason: "token_expired", ip });
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        tokenVersion: { increment: 1 },
      },
    });

    audit("reset-password.success", { userId: user.id });
    return NextResponse.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
