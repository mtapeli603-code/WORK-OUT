import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const reminderSchema = z.object({
  reminderEnabled: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  reminderDays: z.array(z.enum(weekdays)).max(7),
});

export async function GET() {
  try {
    const user = await requireUser();
    const preferences = await prisma.userPreferences.findUnique({ where: { userId: user.userId } });
    return NextResponse.json({
      reminderEnabled: preferences?.reminderEnabled ?? false,
      reminderTime: preferences?.reminderTime ?? "18:00",
      reminderDays: preferences?.reminderDays?.split(",").filter(Boolean) ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "You need to be signed in to view reminders." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not load reminder settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Enter valid reminder settings." }, { status: 400 });
    }

    const parsed = reminderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Enter valid reminder settings." }, { status: 400 });

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.userId },
      update: {
        reminderEnabled: parsed.data.reminderEnabled,
        reminderTime: parsed.data.reminderTime,
        reminderDays: parsed.data.reminderDays.join(","),
      },
      create: {
        userId: user.userId,
        reminderEnabled: parsed.data.reminderEnabled,
        reminderTime: parsed.data.reminderTime,
        reminderDays: parsed.data.reminderDays.join(","),
      },
    });

    return NextResponse.json({
      reminderEnabled: preferences.reminderEnabled,
      reminderTime: preferences.reminderTime,
      reminderDays: preferences.reminderDays?.split(",").filter(Boolean) ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "You need to be signed in to save reminders." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not save reminder settings." }, { status: 500 });
  }
}