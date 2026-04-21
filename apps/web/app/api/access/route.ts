import { NextResponse } from "next/server";

import { accessCookieOptions, ACCESS_COOKIE, grantedCookieValue, isAccessConfigured, verifyAccessKey } from "../../../lib/api/access";

export async function POST(request: Request) {
  const form = await request.formData();
  const accessKey = String(form.get("accessKey") ?? "");
  const nextPath = String(form.get("next") ?? "/platform");
  const safeNext = nextPath.startsWith("/") ? nextPath : "/platform";

  if (!isAccessConfigured()) {
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  if (!verifyAccessKey(accessKey)) {
    return NextResponse.redirect(new URL(`/access?next=${encodeURIComponent(safeNext)}`, request.url));
  }

  const response = NextResponse.redirect(new URL(safeNext, request.url));
  response.cookies.set(ACCESS_COOKIE, grantedCookieValue, accessCookieOptions);
  return response;
}
