import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { passwordSchema } from "@/lib/validation";
import { validateRequestOrigin, validateBodySize } from "@/lib/csrf";
import { authRatelimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sendVerificationEmail, generateEmailToken } from "@/lib/email";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export async function POST(req: NextRequest) {
  const originCheck = validateRequestOrigin(req);
  if (originCheck !== true) { audit("csrf.blocked", { route: "register", ip: req.headers.get("x-forwarded-for") ?? "unknown" }); return originCheck; }

  const sizeCheck = validateBodySize(req);
  if (sizeCheck !== true) { audit("body-too-large", { route: "register" }); return sizeCheck; }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(ip);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "register", ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    audit("register.attempt", { email: parsed.data.email, ip });

    const { email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      audit("register.failure", { email, reason: "email_exists", ip });
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { token: verificationToken, expiry: verificationTokenExpiry } = generateEmailToken();

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    audit("register.success", { email });
    return NextResponse.json({ result: "success", needsVerification: true }, { status: 201 });
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
