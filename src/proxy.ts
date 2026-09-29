import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { sessionSecret } from "@/lib/session-secret";

const protectedPaths = ["/dashboard", "/workouts", "/exercises", "/progress", "/history", "/profile", "/settings", "/workout"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const token = request.cookies.get("form-session")?.value;
  let role: string | undefined;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, sessionSecret);
      role = typeof payload.userId === "string" && (payload.role === "USER" || payload.role === "ADMIN") ? payload.role : undefined;
    } catch {
      role = undefined;
    }
  }
  if (isProtected && !role) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/workouts/:path*", "/exercises/:path*", "/progress/:path*", "/history/:path*", "/profile/:path*", "/settings/:path*", "/workout/:path*", "/admin/:path*"] };