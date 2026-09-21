import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const programSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(800), goal: z.string().min(2), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]), duration: z.number().int().min(1).max(52), weeks: z.number().int().min(1).max(52), daysPerWeek: z.number().int().min(1).max(7), equipment: z.string().min(2), published: z.boolean().default(false) });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: Request) { try { await requireAdmin(); const parsed = programSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Complete all program fields." }, { status: 400 }); const program = await prisma.workoutProgram.create({ data: { ...parsed.data, slug: slugify(parsed.data.name) } }); return NextResponse.json({ program }, { status: 201 }); } catch (error) { if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); return NextResponse.json({ error: "Could not create program." }, { status: 500 }); } }
