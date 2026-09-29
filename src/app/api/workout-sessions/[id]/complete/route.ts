import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const session = await prisma.workoutSession.findFirst({ where: { id, userId: user.userId }, select: { id: true, completedAt: true } });
    if (!session) return NextResponse.json({ error: "Workout session not found." }, { status: 404 });
    if (session.completedAt) return NextResponse.json({ error: "This workout is already complete." }, { status: 409 });
    const completedAt = new Date();
    const result = await prisma.$transaction(async (transaction) => {
      const activeSession = await transaction.workoutSession.findFirst({ where: { id, userId: user.userId, completedAt: null }, include: { workout: { include: { exercises: true } }, exercises: { include: { exercise: true, sets: true }, orderBy: { order: "asc" } } } });
      if (!activeSession) throw new Error("ALREADY_COMPLETED");
      const validSets = activeSession.exercises.flatMap((exercise) => exercise.sets.filter((set) => (set.reps ?? 0) > 0 || (set.durationSeconds ?? 0) > 0));
      if (validSets.length === 0) throw new Error("NO_PROGRESS");
      const durationSeconds = Math.max(0, Math.floor((completedAt.getTime() - activeSession.startedAt.getTime()) / 1000));
      const completed = await transaction.workoutSession.update({ where: { id }, data: { completedAt, durationSeconds }, include: { workout: true, exercises: { include: { exercise: true, sets: true }, orderBy: { order: "asc" } } } });
      const records = [];
      for (const completedExercise of completed.exercises) {
        const heaviest = Math.max(...completedExercise.sets.map((set) => set.weight ?? 0));
        if (heaviest <= 0) continue;
        const previous = await transaction.personalRecord.findFirst({ where: { userId: user.userId, exerciseId: completedExercise.exerciseId, metric: "heaviest_weight" }, orderBy: { value: "desc" } });
        if (!previous || heaviest > previous.value) records.push(await transaction.personalRecord.create({ data: { userId: user.userId, exerciseId: completedExercise.exerciseId, metric: "heaviest_weight", value: heaviest, unit: "kg" } }));
      }
      return { completed, records };
    });
    return NextResponse.json({ session: result.completed, records: result.records });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    if (error instanceof Error && error.message === "ALREADY_COMPLETED") return NextResponse.json({ error: "This workout is already complete." }, { status: 409 });
    if (error instanceof Error && error.message === "NO_PROGRESS") return NextResponse.json({ error: "Record at least one valid set before completing the workout." }, { status: 400 });
    return NextResponse.json({ error: "Could not complete that workout." }, { status: 500 });
  }
}
