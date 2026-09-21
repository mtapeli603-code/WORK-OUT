import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const session = await prisma.workoutSession.findFirst({ where: { id, userId: user.userId }, include: { workout: true, exercises: { include: { exercise: { include: { media: { orderBy: { sortOrder: "asc" } } } }, sets: true }, orderBy: { order: "asc" } } } });
    if (!session) return NextResponse.json({ error: "Workout session not found." }, { status: 404 });
    return NextResponse.json({ session });
  } catch { return NextResponse.json({ error: "You need to be signed in." }, { status: 401 }); }
}