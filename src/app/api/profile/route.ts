import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const profileSchema = z.object({ primaryGoal: z.string().min(2).max(80), fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]), workoutFrequency: z.number().int().min(1).max(7), preferredDuration: z.number().int().min(15).max(180), equipment: z.string().min(2).max(80), trainingDays: z.array(z.string()).max(7) });
const identitySchema = z.object({ name: z.string().trim().min(1).max(80), avatarUrl: z.union([z.url().max(2048), z.literal("")]) });

export async function PATCH(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const identity = identitySchema.safeParse(body);
    if (identity.success) {
      const user = await prisma.user.update({ where: { id: session.userId }, data: { name: identity.data.name, avatarUrl: identity.data.avatarUrl || null }, select: { id: true, name: true, avatarUrl: true } });
      return NextResponse.json({ user });
    }
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Please complete each onboarding choice." }, { status: 400 });
    await prisma.profile.upsert({ where: { userId: session.userId }, update: { ...parsed.data, trainingDays: parsed.data.trainingDays.join(","), onboardingDone: true }, create: { userId: session.userId, ...parsed.data, trainingDays: parsed.data.trainingDays.join(","), onboardingDone: true } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "You need to be signed in to save your profile." }, { status: 401 }); }
}
