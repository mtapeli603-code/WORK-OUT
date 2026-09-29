import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const setSchema = z.object({ completedExerciseId: z.string().min(1), setNumber: z.number().int().min(1), weight: z.number().finite().nonnegative().optional(), reps: z.number().int().min(1).finite().optional(), durationSeconds: z.number().int().min(1).finite().optional(), restSeconds: z.number().int().min(0).finite().max(3600).optional(), notes: z.string().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Enter a valid set." }, { status: 400 });
    }
    const parsed = setSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid set." }, { status: 400 });
    const ownedSession = await prisma.workoutSession.findFirst({ where: { id, userId: user.userId }, select: { id: true, completedAt: true, workoutId: true } });
    if (!ownedSession) return NextResponse.json({ error: "Workout session not found." }, { status: 404 });
    if (ownedSession.completedAt) return NextResponse.json({ error: "This workout is already complete." }, { status: 409 });
    const completedExercise = await prisma.completedExercise.findFirst({ where: { id: parsed.data.completedExerciseId, sessionId: id }, select: { id: true, exerciseId: true, order: true } });
    if (!completedExercise) return NextResponse.json({ error: "Exercise does not belong to this session." }, { status: 400 });
    const workoutExercise = await prisma.workoutExercise.findUnique({ where: { workoutId_order: { workoutId: ownedSession.workoutId, order: completedExercise.order } }, include: { exercise: { select: { type: true } } } });
    if (!workoutExercise || workoutExercise.exerciseId !== completedExercise.exerciseId) return NextResponse.json({ error: "Exercise does not belong to this workout." }, { status: 400 });
    if (parsed.data.setNumber > workoutExercise.sets) return NextResponse.json({ error: "That set number is not part of this workout." }, { status: 400 });
    const requiresDuration = workoutExercise.exercise.type === "CARDIO" || workoutExercise.duration !== null;
    const requiresReps = workoutExercise.exercise.type === "STRENGTH" || workoutExercise.exercise.type === "BODYWEIGHT" || workoutExercise.reps !== null;
    if (requiresDuration && parsed.data.durationSeconds === undefined) return NextResponse.json({ error: "Enter the exercise duration." }, { status: 400 });
    if (requiresReps && parsed.data.reps === undefined) return NextResponse.json({ error: "Enter the exercise repetitions." }, { status: 400 });
    if (!requiresDuration && !requiresReps && parsed.data.reps === undefined && parsed.data.durationSeconds === undefined) return NextResponse.json({ error: "Enter repetitions or duration." }, { status: 400 });
    const set = await prisma.completedSet.upsert({ where: { completedExerciseId_setNumber: { completedExerciseId: parsed.data.completedExerciseId, setNumber: parsed.data.setNumber } }, update: parsed.data, create: parsed.data });
    return NextResponse.json({ set });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    return NextResponse.json({ error: "Could not save that set." }, { status: 500 });
  }
}
