import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    cookieName: `${cookiePrefix}merchant.session-token`,
    secret: process.env.NEXTAUTH_SECRET ?? (() => { throw new Error("NEXTAUTH_SECRET environment variable is not set"); })(),
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all routes inside the merchant dashboard
  matcher: [
    "/dashboard",
    "/transactions"
  ],
};
