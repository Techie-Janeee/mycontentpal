import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sessionRatelimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await sessionRatelimit.limit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429 }
    );
  }

  try {
    const sessions = await prisma.contentSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("[SESSIONS ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
