import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const exerciseSchema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().min(10).max(500), instructions: z.string().trim().min(10).max(1000), primaryMuscle: z.string().min(2), equipment: z.string().min(2), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]), type: z.enum(["STRENGTH", "BODYWEIGHT", "CARDIO", "STRETCHING", "MOBILITY"]) });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: Request) {
  try { await requireAdmin(); const parsed = exerciseSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Complete all exercise fields." }, { status: 400 }); const exercise = await prisma.exercise.create({ data: { ...parsed.data, slug: slugify(parsed.data.name) } }); return NextResponse.json({ exercise }, { status: 201 }); } catch (error) { if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); return NextResponse.json({ error: "Could not create exercise." }, { status: 500 }); }
}
