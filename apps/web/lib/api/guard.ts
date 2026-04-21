import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { ACCESS_COOKIE, grantedCookieValue, isAccessConfigured } from "./access";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 90;
const requestBuckets = new Map<string, { count: number; startedAt: number }>();

const getIp = (request: NextRequest): string =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

export const requireApiAccess = (request: NextRequest): NextResponse | null => {
  if (!isAccessConfigured()) return null;
  const accessCookie = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessCookie === grantedCookieValue) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
};

export const enforceApiRateLimit = (request: NextRequest): NextResponse | null => {
  const ip = getIp(request);
  const now = Date.now();
  const bucket = requestBuckets.get(ip);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    requestBuckets.set(ip, { count: 1, startedAt: now });
    return null;
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json({ error: "Rate limit exceeded. Please retry shortly." }, { status: 429 });
  }
  bucket.count += 1;
  return null;
};
