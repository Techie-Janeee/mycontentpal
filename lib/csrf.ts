import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 102_400;

export function validateBodySize(req: NextRequest): true | NextResponse {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }
  return true;
}

const ALLOWED_ORIGINS = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (ALLOWED_ORIGINS.size > 0) return ALLOWED_ORIGINS;

  const origins = [
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  for (const origin of origins) {
    ALLOWED_ORIGINS.add(origin.replace(/\/$/, ""));
  }

  return ALLOWED_ORIGINS;
}

export function validateRequestOrigin(req: NextRequest): true | NextResponse {
  const allowedOrigins = getAllowedOrigins();

  const origin = req.headers.get("origin")?.replace(/\/$/, "");
  const referer = req.headers.get("referer")?.replace(/\/$/, "");

  if (origin && allowedOrigins.has(origin)) return true;

  if (referer) {
    for (const allowed of allowedOrigins) {
      if (referer.startsWith(allowed)) return true;
    }
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
