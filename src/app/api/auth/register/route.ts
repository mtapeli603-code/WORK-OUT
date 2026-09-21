import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const registrationSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email(), password: z.string().min(8).max(128) });

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid name, email, and password." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({ data: { name: parsed.data.name, email, passwordHash, profile: { create: {} }, preferences: { create: {} } }, select: { id: true, role: true } });
  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ ok: true }, { status: 201 });
}
