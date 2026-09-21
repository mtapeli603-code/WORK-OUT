import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "form-session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-only-change-me");

type SessionPayload = { userId: string; role: "USER" | "ADMIN" };

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || (payload.role !== "USER" && payload.role !== "ADMIN")) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session ? prisma.user.findUnique({ where: { id: session.userId }, include: { profile: true, preferences: true } }) : null;
}
