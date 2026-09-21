import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const session = await prisma.workoutSession.findFirst({ where: { id, userId: user.userId }, include: { exercises: { include: { sets: true } } } });
    if (!session) return NextResponse.json({ error: "Workout session not found." }, { status: 404 });
    const completed = await prisma.workoutSession.update({ where: { id }, data: { completedAt: new Date(), durationSeconds: typeof body.durationSeconds === "number" ? body.durationSeconds : undefined }, include: { workout: true, exercises: { include: { exercise: true, sets: true }, orderBy: { order: "asc" } } } });
    const records = [];
    for (const completedExercise of completed.exercises) {
      const heaviest = Math.max(...completedExercise.sets.map((set) => set.weight ?? 0));
      if (heaviest <= 0) continue;
      const previous = await prisma.personalRecord.findFirst({ where: { userId: user.userId, exerciseId: completedExercise.exerciseId, metric: "heaviest_weight" }, orderBy: { value: "desc" } });
      if (!previous || heaviest > previous.value) records.push(await prisma.personalRecord.create({ data: { userId: user.userId, exerciseId: completedExercise.exerciseId, metric: "heaviest_weight", value: heaviest, unit: "kg" } }));
    }
    return NextResponse.json({ session: completed, records });
  } catch { return NextResponse.json({ error: "Could not complete that workout." }, { status: 500 }); }
}
