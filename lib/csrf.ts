import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 102_400;

export function validateBodySize(req: NextRequest): true | NextResponse {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }
  return true;
}

export function validateRequestOrigin(req: NextRequest): true | NextResponse {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowedOrigin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (origin) {
    if (origin === allowedOrigin) return true;
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (referer) {
    if (referer.startsWith(allowedOrigin)) return true;
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
