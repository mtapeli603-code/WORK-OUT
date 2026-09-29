import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const startSchema = z.object({ workoutSlug: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "A workout is required." }, { status: 400 });
    }
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "A workout is required." }, { status: 400 });
    const workout = await prisma.workout.findUnique({ where: { slug: parsed.data.workoutSlug }, include: { program: { include: { plans: { where: { userId: user.userId, active: true }, select: { id: true } } } }, exercises: { orderBy: { order: "asc" } } } });
    if (!workout) return NextResponse.json({ error: "Workout not found." }, { status: 404 });
    const canAccess = workout.program?.published || workout.program?.plans.length;
    if (!canAccess) return NextResponse.json({ error: "You do not have access to this workout." }, { status: 403 });
    const session = await prisma.workoutSession.create({ data: { userId: user.userId, workoutId: workout.id, exercises: { create: workout.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId, order: exercise.order })) } }, include: { workout: true, exercises: { include: { exercise: { include: { media: { orderBy: { sortOrder: "asc" } } } }, sets: true }, orderBy: { order: "asc" } } } });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "You need to be signed in to start a workout." }, { status: 401 });
    return NextResponse.json({ error: "Could not start that workout." }, { status: 500 });
  }
}
