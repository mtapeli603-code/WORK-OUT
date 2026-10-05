import { WorkoutReminderNotice } from "@/components/workout-reminders";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DashboardWorkoutReminder() {
  const user = await getCurrentUser();
  if (!user) return null;

  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    select: { completedAt: true },
  });
  const completedAt = completedSessions.flatMap((session) => session.completedAt ? [session.completedAt.toISOString()] : []);

  return (
    <WorkoutReminderNotice
      enabled={user.preferences?.reminderEnabled ?? false}
      time={user.preferences?.reminderTime ?? "18:00"}
      days={user.preferences?.reminderDays?.split(",").filter(Boolean) ?? []}
      completedAt={completedAt}
    />
  );
}