import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const startSchema = z.object({ workoutSlug: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = startSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "A workout is required." }, { status: 400 });
    const workout = await prisma.workout.findUnique({ where: { slug: parsed.data.workoutSlug }, include: { exercises: { orderBy: { order: "asc" } } } });
    if (!workout) return NextResponse.json({ error: "Workout not found." }, { status: 404 });
    const session = await prisma.workoutSession.create({ data: { userId: user.userId, workoutId: workout.id, exercises: { create: workout.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId, order: exercise.order })) } }, include: { workout: true, exercises: { include: { exercise: { include: { media: { orderBy: { sortOrder: "asc" } } } }, sets: true }, orderBy: { order: "asc" } } } });
    return NextResponse.json({ session }, { status: 201 });
  } catch { return NextResponse.json({ error: "You need to be signed in to start a workout." }, { status: 401 }); }
}
