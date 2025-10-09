import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This runs on EVERY request
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes — anyone can access
  const publicPaths = ["/", "/login", "/api/auth"];

  // 1️⃣ Allow access to public routes and static assets
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // 2️⃣ If not logged in → redirect to home page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 3️⃣ If user is logged in but tries to access unauthorized routes
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/login"; // send non-admins to home
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/user") && token.role !== "user") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 4️⃣ Otherwise, allow request
  return NextResponse.next();
}

// Apply middleware to specific routes only
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"], // protects all subroutes
};
