import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const updateSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), description: z.string().trim().min(10).max(500).optional(), instructions: z.string().trim().min(10).max(1000).optional(), primaryMuscle: z.string().min(2).optional(), equipment: z.string().min(2).optional(), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(), type: z.enum(["STRENGTH", "BODYWEIGHT", "CARDIO", "STRETCHING", "MOBILITY"]).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdmin(); const { id } = await params; const parsed = updateSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid exercise update." }, { status: 400 }); const exercise = await prisma.exercise.update({ where: { id }, data: parsed.data }); return NextResponse.json({ exercise }); } catch (error) { if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); return NextResponse.json({ error: "Could not update exercise." }, { status: 500 }); } }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdmin(); const { id } = await params; await prisma.exercise.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch (error) { if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); return NextResponse.json({ error: "Could not delete exercise." }, { status: 500 }); } }
