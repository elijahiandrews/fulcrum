import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, grantedCookieValue, isAccessConfigured } from "./lib/api/access";

const GATED_PATH_PREFIXES = [
  "/platform",
  "/actions",
  "/regional-monitor",
  "/alerts-center",
  "/symbol",
  "/api/platform",
  "/api/regions",
  "/api/alerts",
  "/api/intel",
  "/api/symbols"
];

const isGatedPath = (pathname: string): boolean => GATED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function middleware(request: NextRequest) {
  if (!isAccessConfigured()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (!isGatedPath(pathname)) return NextResponse.next();

  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === grantedCookieValue;
  if (hasAccess) return NextResponse.next();

  // APIs should return auth status directly, pages should redirect to gate screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/platform/:path*",
    "/actions/:path*",
    "/regional-monitor/:path*",
    "/alerts-center/:path*",
    "/symbol/:path*",
    "/api/platform/:path*",
    "/api/regions/:path*",
    "/api/alerts/:path*",
    "/api/intel/:path*",
    "/api/symbols/:path*"
  ]
};
