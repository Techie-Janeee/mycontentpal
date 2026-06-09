import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GenerateInputSchema } from "@/lib/validation";
import { sanitize, isVagueNiche } from "@/lib/utils";
import { generateContent } from "@/lib/generate";
import { ratelimit } from "@/lib/ratelimit";
import { validateBodySize } from "@/lib/csrf";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sizeCheck = validateBodySize(req);
  if (sizeCheck !== true) { audit("body-too-large", { route: "generate" }); return sizeCheck; }

  const userId = session.user.id;

  const { success: allowed } = await ratelimit.limit(userId);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "generate", userId });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const generationsToday = await prisma.contentSession.count({
    where: { userId, createdAt: { gte: todayStart } },
  });

  if (generationsToday >= 12) {
    return NextResponse.json(
      { error: "Daily generation limit reached. You can generate up to 12 times per day." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = GenerateInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const inputData = parsed.data;
    const sanitizedNiche = sanitize(inputData.niche);
    
    if (isVagueNiche(sanitizedNiche)) {
      return NextResponse.json(
        { error: "Your niche is too broad. Please be more specific (e.g. 'Fitness for busy moms' instead of 'Fitness')." },
        { status: 400 }
      );
    }

    inputData.niche = sanitizedNiche;

    const result = await generateContent(inputData);

    const outputData = {
      action: inputData.action,
      result,
      createdAt: new Date().toISOString(),
    };

    await prisma.contentSession.create({
      data: {
        userId,
        inputData: inputData as any,
        outputData: outputData as any,
      },
    });

    audit("generate.success", { userId, action: inputData.action, niche: sanitizedNiche });
    return NextResponse.json(outputData, { status: 200 });
  } catch (error) {
    audit("generate.failure", { userId });
    console.error("[GENERATE ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
