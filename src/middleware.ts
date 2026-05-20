import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicPaths = ["/auth", "/api/auth"];

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/auth).*)", "/"],
};
