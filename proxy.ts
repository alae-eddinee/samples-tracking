import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Redirect authenticated users away from /login
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Require auth for all non-login pages
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin-only pages
  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
