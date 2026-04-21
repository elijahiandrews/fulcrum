export const ACCESS_COOKIE = "fulcrum_access";
const ACCESS_COOKIE_VALUE = "granted";

export const isAccessConfigured = (): boolean => Boolean(process.env.FULCRUM_ACCESS_KEY?.trim());

export const verifyAccessKey = (input: string): boolean => {
  const expected = process.env.FULCRUM_ACCESS_KEY?.trim();
  if (!expected) return false;
  return input.trim() === expected;
};

export const accessCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 12
};

export const grantedCookieValue = ACCESS_COOKIE_VALUE;
