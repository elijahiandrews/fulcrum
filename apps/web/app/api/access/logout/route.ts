import { NextResponse } from "next/server";

import { ACCESS_COOKIE, accessCookieOptions } from "../../../../lib/api/access";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/access", request.url));
  response.cookies.set(ACCESS_COOKIE, "", { ...accessCookieOptions, maxAge: 0 });
  return response;
}
