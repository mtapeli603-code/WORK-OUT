import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const setSchema = z.object({ completedExerciseId: z.string().min(1), setNumber: z.number().int().min(1), weight: z.number().nonnegative().optional(), reps: z.number().int().nonnegative().optional(), durationSeconds: z.number().int().nonnegative().optional(), restSeconds: z.number().int().nonnegative().optional(), notes: z.string().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const parsed = setSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid set." }, { status: 400 });
    const ownedSession = await prisma.workoutSession.findFirst({ where: { id, userId: user.userId }, select: { id: true } });
    if (!ownedSession) return NextResponse.json({ error: "Workout session not found." }, { status: 404 });
    const completedExercise = await prisma.completedExercise.findFirst({ where: { id: parsed.data.completedExerciseId, sessionId: id }, select: { id: true } });
    if (!completedExercise) return NextResponse.json({ error: "Exercise does not belong to this session." }, { status: 400 });
    const set = await prisma.completedSet.upsert({ where: { completedExerciseId_setNumber: { completedExerciseId: parsed.data.completedExerciseId, setNumber: parsed.data.setNumber } }, update: parsed.data, create: parsed.data });
    return NextResponse.json({ set });
  } catch { return NextResponse.json({ error: "Could not save that set." }, { status: 500 }); }
}
