import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateRequestOrigin } from "@/lib/csrf";
import { authRatelimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { hashToken } from "@/lib/email";

const VerifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const originCheck = validateRequestOrigin(req);
  if (originCheck !== true) return originCheck;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(ip);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "verify-email", ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const { token } = parsed.data;
    const hashed = hashToken(token);

    const user = await prisma.user.findUnique({
      where: { verificationToken: hashed },
    });

    if (!user || !user.verificationTokenExpiry) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification link has expired. Please sign up again." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("[VERIFY EMAIL ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
